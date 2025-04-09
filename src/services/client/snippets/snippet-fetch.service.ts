import { ILanguage } from "@/types/language";
import { ISnippet } from "@/types/server/snippet";

const internalApiHeader = {
  "x-internal-api": "true",
}

export async function fetchRandomSnippets(languageId: string): Promise<ISnippet[]> {
  const url = `api/snippets/random?language=${encodeURIComponent(languageId)}`;

  const response = await fetch(url, {
    headers: internalApiHeader,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status code ${response.status}`);
  }

  return await response.json();
}

export async function fetchLanguages(): Promise<{[key: string]: ILanguage}> {
  const url = `api/snippets/languages`;

  const response = await fetch(url, {
    headers: internalApiHeader,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status code ${response.status}`);
  }

  return await response.json();
}
