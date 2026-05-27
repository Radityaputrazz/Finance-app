import { NextResponse } from "next/server";
import type { RateLimitResult } from "./ratelimit";
import { captureError } from "./sentry";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorizedResponse() {
  return errorResponse("Unauthorized", 401);
}

export function notFoundResponse(resource = "Resource") {
  return errorResponse(`${resource} tidak ditemukan`, 404);
}

export function serverErrorResponse(error?: unknown) {
  console.error("[API Error]", error);
  captureError(error, { source: "api_route" });
  return errorResponse("Terjadi kesalahan server", 500);
}

export function rateLimitResponse(result: RateLimitResult) {
  return NextResponse.json(
    { error: "Terlalu banyak permintaan. Coba lagi dalam beberapa saat." },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.reset),
        "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
      },
    }
  );
}