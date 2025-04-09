import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isDev } from "@/constants/env";
import { rateLimiter } from "@/lib/server/middleware/rate-limiter";

export async function middleware(req: NextRequest) {
  if (!isDev) {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || req.nextUrl.hostname;

    try {
      await rateLimiter.consume(ip?.toString() || "unknown");
    } catch {
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    const internalApi = req.headers.get("x-internal-api");

    if (internalApi !== "true") {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
