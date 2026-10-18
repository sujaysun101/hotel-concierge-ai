import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

type Bucket = { tokens: number; updated: number }

const buckets = new Map<string, Bucket>()
const limiters = new Map<string, Ratelimit>()

function upstashEnabled(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

function limiter(limit: number, windowMs: number): Ratelimit {
  const key = `${limit}:${windowMs}`
  const existing = limiters.get(key)
  if (existing) return existing
  const seconds = Math.max(1, Math.round(windowMs / 1000))
  const created = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.tokenBucket(limit, `${seconds} s` as `${number} s`, limit),
    prefix: "turndown",
  })
  limiters.set(key, created)
  return created
}

export function takeMemoryToken(
  store: Map<string, Bucket>,
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): { ok: boolean; retryAfter: number } {
  const rate = limit / windowMs
  const current = store.get(key) ?? { tokens: limit, updated: now }
  const elapsed = Math.max(0, now - current.updated)
  current.tokens = Math.min(limit, current.tokens + elapsed * rate)
  current.updated = now
  if (current.tokens < 1) {
    const retryAfter = Math.ceil((1 - current.tokens) / rate / 1000)
    store.set(key, current)
    return { ok: false, retryAfter }
  }
  current.tokens -= 1
  store.set(key, current)
  return { ok: true, retryAfter: 0 }
}

export async function rateLimit(
  key: string,
  limit = 30,
  windowMs = 10 * 60 * 1000,
): Promise<{ ok: boolean; retryAfter: number }> {
  if (upstashEnabled()) {
    const result = await limiter(limit, windowMs).limit(key)
    return { ok: result.success, retryAfter: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)) }
  }
  return takeMemoryToken(buckets, key, limit, windowMs)
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() || "local"
  return request.headers.get("x-real-ip") ?? "local"
}
