type RateLimitState = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  windowMs: number;
  max: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterMs: number;
  remaining: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __fitnexisRateLimitStore?: Map<string, RateLimitState>;
};

const rateLimitStore = globalForRateLimit.__fitnexisRateLimitStore ?? new Map<string, RateLimitState>();

globalForRateLimit.__fitnexisRateLimitStore = rateLimitStore;

function cleanupExpiredEntries(now: number) {
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function consumeRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + options.windowMs
    });

    return {
      allowed: true,
      retryAfterMs: 0,
      remaining: Math.max(0, options.max - 1)
    };
  }

  if (current.count >= options.max) {
    return {
      allowed: false,
      retryAfterMs: current.resetAt - now,
      remaining: 0
    };
  }

  current.count += 1;
  rateLimitStore.set(key, current);

  return {
    allowed: true,
    retryAfterMs: 0,
    remaining: Math.max(0, options.max - current.count)
  };
}