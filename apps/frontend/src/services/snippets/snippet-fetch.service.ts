import {LanguageName} from "@lib/types/CodeLanguage";

export async function fetchRandomSnippets(language: LanguageName): Promise<string[]> {
  const url = `api/snippets/random?language=${encodeURIComponent(language)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status code ${response.status}`);
  }

  return response.json();
}
