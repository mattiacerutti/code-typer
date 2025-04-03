import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {rateLimit} from "@/lib/server/middleware/rate-limiter";

export function middleware(req: NextRequest) {
  const resRateLimit = rateLimit(req);
  if (resRateLimit) return resRateLimit;

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
