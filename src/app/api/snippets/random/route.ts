import { MIN_CACHED_SNIPPETS, SNIPPETS_SIMULTANEOUS_REQUESTS } from "@/constants/api/snippets";
import { Language } from "@/constants/supported-languages";
import { fetchRandomCodeFiles, getFileContent } from "@/services/api/snippet-fetch.service";
import { extractSnippets, filterSnippets, formatCode } from "@/services/api/snippet-process.service";
import { getUniqueRandomIndexes } from "@/utils/api/snippet-utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  console.log("language");
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('language');
  console.log("languagasdsadasde", language);

  const snippets = await getRandomCodeSnippets(language as Language);

  return NextResponse.json(snippets);
}

async function getRandomCodeSnippets(language: Language): Promise<string[]> {
  const snippetUrls = await fetchRandomCodeFiles(language)
    .catch((error) => {
      console.error('Error fetching random files:', error);
      return [];
    });

  const codeSnippets: string[] = await getSnippetsBatch(
    snippetUrls,
    language,
  );

  if (codeSnippets.length === 0)
    throw "Couldn't find any valid nodes in any of the fetched files";

  // Shuffle snippets before returning
  return codeSnippets.sort(() => 0.5 - Math.random());
};

async function getSnippetsFromLink(
  link: string,
  language: Language,
): Promise<string[]> {
  const fileContent = await getFileContent(link);

  const extractedSnippets = extractSnippets(
    fileContent,
    language,
  );

  let codeSnippets = extractedSnippets
    .map((snippet) => {
      const formattedSnippet = formatCode(snippet);

      // console.log("Raw snippet:", JSON.stringify(snippet));

      if (!formattedSnippet) return null;

      // console.log("Formatted snippet:", JSON.stringify(formattedSnippet));

      return formattedSnippet;
    })
    .filter((snippet) => snippet !== null);

  codeSnippets = filterSnippets(codeSnippets);

  return codeSnippets;
}

async function getSnippetsBatch(
  snippetUrls: string[],
  language: Language,
): Promise<string[]> {
  const codeSnippets: string[] = [];
  while (codeSnippets.length < MIN_CACHED_SNIPPETS) {
    if (snippetUrls.length === 0) break;

    // Gets N unquie random indexes. Number could be changed to increase concurrency
    const randomIndexes = getUniqueRandomIndexes(
      snippetUrls.length,
      SNIPPETS_SIMULTANEOUS_REQUESTS,
    );

    // Simultaneously get snippets different files
    const snippetPromises = randomIndexes.map((randomIndex) =>
      getSnippetsFromLink(snippetUrls[randomIndex], language),
    );
    const snippets = (await Promise.all(snippetPromises)).flat();

    codeSnippets.push(...snippets);

    // Removes already fetched files
    snippetUrls = snippetUrls.filter((_, i) => !randomIndexes.includes(i));
  }

  return codeSnippets;
}
