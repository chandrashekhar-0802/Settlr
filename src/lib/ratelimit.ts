import "server-only";

// ponytail: in-memory sliding window per server instance. Serverless instances don't share it, so it only
// slows bursts; move to Upstash/Redis or a Postgres counter if abuse becomes real.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000) {
  if (process.env.RATE_LIMIT_OFF === "1") return true; // e2e test runs only — never set in production
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) return false;
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return true;
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}
