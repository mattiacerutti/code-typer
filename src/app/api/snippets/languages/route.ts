import { rateLimit } from "@/core/middleware/rate-limiter";
import {getLanguages} from "@/features/snippets/infrastructure/repositories/language.repository.server";
import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
  const resRateLimit = rateLimit(request);
  if (resRateLimit) return resRateLimit;
  
  const languages = await getLanguages();
  return NextResponse.json(languages);
}
