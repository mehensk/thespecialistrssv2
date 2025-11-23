/**
 * Rate limiting utility
 * 
 * This is a basic in-memory rate limiter for development.
 * For production, consider using a Redis-based solution like @upstash/ratelimit
 */

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (for development only - use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Simple in-memory rate limiter
 * WARNING: This only works for single-instance deployments.
 * For production with multiple instances, use Redis-based rate limiting.
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 60000, maxRequests: 10 }
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up old entries periodically (every 1000 checks)
  if (Math.random() < 0.001) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired entry
    const resetAt = now + options.windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt,
    });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetAt,
    };
  }

  // Entry exists and is still valid
  if (entry.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (for production behind proxy)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwardedFor) {
    // Take first IP if multiple
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a default identifier (not ideal, but works for development)
  return 'unknown';
}

/**
 * Rate limit middleware for API routes
 * 
 * Usage:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const identifier = getClientIdentifier(request);
 *   const rateLimit = await checkRateLimit(identifier, {
 *     windowMs: 60000, // 1 minute
 *     maxRequests: 10, // 10 requests per minute
 *   });
 *   
 *   if (!rateLimit.allowed) {
 *     return NextResponse.json(
 *       { error: 'Too many requests' },
 *       {
 *         status: 429,
 *         headers: {
 *           'X-RateLimit-Limit': '10',
 *           'X-RateLimit-Remaining': rateLimit.remaining.toString(),
 *           'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
 *         },
 *       }
 *     );
 *   }
 *   
 *   // Continue with request...
 * }
 * ```
 */

/**
 * Production-ready rate limiting with Upstash Redis
 * 
 * To use this instead of the in-memory limiter:
 * 
 * 1. Install: npm install @upstash/ratelimit @upstash/redis
 * 2. Set environment variables:
 *    UPSTASH_REDIS_REST_URL=...
 *    UPSTASH_REDIS_REST_TOKEN=...
 * 3. Uncomment and use the code below:
 */

/*
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

export async function checkRateLimitUpstash(identifier: string) {
  const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
  
  return {
    allowed: success,
    remaining,
    resetAt: reset,
    limit,
  };
}
*/

