import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Lazily initialized Redis client
let redis: Redis | null = null;
let ratelimiters: Record<string, Ratelimit> = {};

function getRedis(): Redis {
  if (!redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required");
    }
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

// Different limiters for different endpoints
const LIMITERS = {
  // General API — 60 requests per minute per user
  api: { requests: 60, window: "1 m" },
  // Auth endpoints — 10 requests per minute per IP (prevent brute force)
  auth: { requests: 10, window: "1 m" },
  // Write operations — 30 per minute per user
  write: { requests: 30, window: "1 m" },
  // Stats/reports — 20 per minute (expensive queries)
  stats: { requests: 20, window: "1 m" },
} as const;

function getLimiter(type: keyof typeof LIMITERS): Ratelimit {
  if (!ratelimiters[type]) {
    const config = LIMITERS[type];
    ratelimiters[type] = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(config.requests, config.window as any),
      analytics: true,
      prefix: `financeku:${type}`,
    });
  }
  return ratelimiters[type];
}

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

export async function rateLimit(
  identifier: string,
  type: keyof typeof LIMITERS = "api"
): Promise<RateLimitResult> {
  // Skip rate limiting if Redis not configured (development)
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return { success: true, limit: 999, remaining: 999, reset: 0 };
  }

  try {
    const limiter = getLimiter(type);
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // Fail open — if Redis is down, allow request
    console.error("[RateLimit Error]", error);
    return { success: true, limit: 999, remaining: 999, reset: 0 };
  }
}