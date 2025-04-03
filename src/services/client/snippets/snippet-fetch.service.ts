import { ILanguage } from "@/types/language";

export async function fetchRandomSnippets(languageId: string): Promise<string[]> {
  const url = `api/snippets/random?language=${encodeURIComponent(languageId)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status code ${response.status}`);
  }

  return await response.json();
}

export async function fetchLanguages(): Promise<{[key: string]: ILanguage}> {
  const url = `api/snippets/languages`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status code ${response.status}`);
  }

  return await response.json();
}
