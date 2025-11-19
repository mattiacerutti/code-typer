import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

export async function proxy(req: NextRequest) {
  const internalApi = req.headers.get("x-internal-api");

  if (internalApi !== "true") {
    return new NextResponse(JSON.stringify({error: "Forbidden"}), {
      status: 403,
      headers: {"Content-Type": "application/json"},
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
