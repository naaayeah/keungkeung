import { createHash } from "crypto";

interface CacheEntry {
  result: unknown;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 1000 * 60 * 60 * 24; // 24h

export function hashImage(base64: string): string {
  return createHash("sha256").update(base64).digest("hex");
}

export function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.result;
}

export function setCached(key: string, result: unknown): void {
  cache.set(key, { result, timestamp: Date.now() });
}
