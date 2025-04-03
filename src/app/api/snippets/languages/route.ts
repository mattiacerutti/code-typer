import {getLanguages} from "@/repositories/language.repository";
import {NextResponse} from "next/server";

export async function GET() {
  const languages = await getLanguages();
  return NextResponse.json(languages);
}
