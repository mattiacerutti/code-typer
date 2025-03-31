import {Language} from "@/constants/supported-languages";

export async function fetchRandomSnippets(language: Language): Promise<string[]> {
  const url = `api/snippets/random?language=${encodeURIComponent(language)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status code ${response.status}`);
  }

  return response.json();
}
