import { LanguageId } from "@/types/language";

export async function fetchRandomSnippets(languageId: LanguageId): Promise<string[]> {
  const url = `api/snippets/random?language=${encodeURIComponent(languageId)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status code ${response.status}`);
  }

  return await response.json();
}
