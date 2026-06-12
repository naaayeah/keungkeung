interface Record {
  count: number;
  windowStart: number;
  dailyCount: number;
  dayStart: number;
}

const store = new Map<string, Record>();
const PER_MINUTE = 5;
const DAILY_LIMIT = parseInt(process.env.DAILY_LIMIT ?? "20", 10);

function now() {
  return Date.now();
}

function getRecord(ip: string): Record {
  const t = now();
  let r = store.get(ip);
  if (!r) {
    r = { count: 0, windowStart: t, dailyCount: 0, dayStart: t };
    store.set(ip, r);
  }
  // reset minute window
  if (t - r.windowStart > 60_000) {
    r.count = 0;
    r.windowStart = t;
  }
  // reset day window
  if (t - r.dayStart > 86_400_000) {
    r.dailyCount = 0;
    r.dayStart = t;
  }
  return r;
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: "per_minute" | "per_hour" | "daily" };

export function checkRateLimit(ip: string): RateLimitResult {
  const r = getRecord(ip);
  if (r.dailyCount >= DAILY_LIMIT) return { allowed: false, reason: "daily" };
  if (r.count >= PER_MINUTE) return { allowed: false, reason: "per_minute" };
  r.count++;
  r.dailyCount++;
  return { allowed: true };
}

export function getDailyRemaining(ip: string): number {
  const r = getRecord(ip);
  return Math.max(0, DAILY_LIMIT - r.dailyCount);
}
