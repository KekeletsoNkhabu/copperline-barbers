/**
 * Small in-memory sliding-window limiter. On serverless each instance keeps its
 * own counters, so this is a best-effort brake on abuse, not a hard guarantee.
 * Swap for Upstash/Redis if stricter limits are needed. The database
 * constraint, not this limiter, is what prevents double bookings.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return true;
}
