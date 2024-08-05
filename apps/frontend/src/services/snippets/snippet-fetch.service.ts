import {LanguageName} from "@lib/types/CodeLanguage";

export async function fetchRandomSnippets(language: LanguageName): Promise<string[]> {
  const url = `http://localhost:3000/snippets/random?language=${language}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status code ${response.status}`);
  }

  return response.json();
}
