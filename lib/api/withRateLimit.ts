import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { rateLimit } from "@/lib/utils/ratelimit";
import { rateLimitResponse, unauthorizedResponse } from "@/lib/utils/api";

type RateLimitType = "api" | "auth" | "write" | "stats";

// Get client IP from request headers
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "anonymous"
  );
}

// Wrap an API route handler with rate limiting
export function withRateLimit(
  handler: (req: NextRequest, ctx: any) => Promise<NextResponse>,
  type: RateLimitType = "api"
) {
  return async (req: NextRequest, ctx: any) => {
    // Get identifier: authenticated user ID or IP address
    const session = await auth();
    const identifier = session?.user?.id ?? getClientIp(req);

    const result = await rateLimit(identifier, type);

    if (!result.success) {
      return rateLimitResponse(result);
    }

    return handler(req, ctx);
  };
}

// Auth-specific wrapper — always uses IP to prevent credential stuffing
export function withAuthRateLimit(
  handler: (req: NextRequest, ctx: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx: any) => {
    const ip = getClientIp(req);
    const result = await rateLimit(`auth:${ip}`, "auth");

    if (!result.success) {
      return rateLimitResponse(result);
    }

    return handler(req, ctx);
  };
}