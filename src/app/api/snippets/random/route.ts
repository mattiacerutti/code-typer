import { rateLimit } from "@/lib/server/middleware/rate-limiter";
import {doesLanguageExist} from "@/repositories/language.repository";
import { getRandomSnippets } from "@/services/server/snippets.service";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  const resRateLimit = rateLimit(request);
  if (resRateLimit) return resRateLimit;

  const {searchParams} = new URL(request.url);
  let languageId = searchParams.get("language");

  if (!languageId) {
    return NextResponse.json({error: "Language not provided"}, {status: 400});
  }

  languageId = languageId.toLowerCase();

  // Check if language provided exists
  const languageExists = await doesLanguageExist(languageId);
  if (!languageExists) {
    return NextResponse.json({error: "Language not found"}, {status: 404});
  }

  try {
    const snippets = await getRandomSnippets(languageId);
    return NextResponse.json(snippets);
  } catch (error) {
    console.error("Error fetching random snippets:", error);
    return NextResponse.json({error: "Failed to fetch random snippets"}, {status: 500});
  }
}




