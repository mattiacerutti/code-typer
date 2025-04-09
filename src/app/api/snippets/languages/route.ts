import { rateLimit } from "@/lib/server/middleware/rate-limiter";
import {getLanguages} from "@/repositories/language.repository";
import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
  const resRateLimit = rateLimit(request);
  if (resRateLimit) return resRateLimit;
  
  const languages = await getLanguages();
  return NextResponse.json(languages);
}
