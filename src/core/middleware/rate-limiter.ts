import {NextRequest} from "next/server";

type RateLimitEntry = {
  count: number;
  lastRequest: number;
};

const ipStore = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30;

export function rateLimit(req: NextRequest): boolean {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";

  const now = Date.now();
  const entry = ipStore.get(ip);

  if (entry) {
    if (now - entry.lastRequest < WINDOW_MS) {
      if (entry.count >= MAX_REQUESTS) {
        return true;
      }
      entry.count += 1;
    } else {
      entry.count = 1;
      entry.lastRequest = now;
    }
  } else {
    ipStore.set(ip, {count: 1, lastRequest: now});
  }

  return false;
}
