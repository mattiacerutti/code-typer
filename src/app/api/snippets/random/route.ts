import {MIN_SNIPPETS_PER_LANGUAGE, RANDOM_SNIPPETS_FETCHED, MAX_SNIPPETS_FETCH_ATTEMPTS} from "@/constants/api/snippets";
import {doesLanguageExist} from "@/repositories/language.repository";
import {getFileContent} from "@/services/api/snippet-fetch.service";
import {extractSnippets, filterSnippets, formatCode} from "@/services/api/snippet-process.service";
import {NextResponse} from "next/server";
import {fetchRandomSnippets, setSnippetAsNonValid} from "@/repositories/snippet.repository";

export async function GET(request: Request) {
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
    const snippets = await getRandomSnippets(languageId, RANDOM_SNIPPETS_FETCHED);
    return NextResponse.json(snippets);
  } catch (error) {
    console.error("Error fetching random snippets:", error);
    return NextResponse.json({error: "Failed to fetch random snippets"}, {status: 500});
  }
}

async function getRandomSnippets(languageId: string, quantity: number): Promise<string[]> {
  const snippets: string[] = [];
  const fetchedUrls: string[] = [];

  let attempts = 0;
  while (snippets.length < MIN_SNIPPETS_PER_LANGUAGE && attempts < MAX_SNIPPETS_FETCH_ATTEMPTS) {
    // Fetch n random snippetUrls from DB
    const fileUrls = await fetchRandomSnippets(languageId, quantity, fetchedUrls).catch((error) => {
      console.error("Error fetching random files:", error);
      return [];
    });

    // Add fileUrls to fetchedUrls array
    fetchedUrls.push(...fileUrls);

    // Get processed snippets from snippetUrls
    const retrievedSnippets = await getSnippetsFromUrls(fileUrls, languageId);

    snippets.push(...retrievedSnippets);
    attempts++;
  }

  if (snippets.length < MIN_SNIPPETS_PER_LANGUAGE) {
    throw new Error(`Failed to fetch enough snippets in ${MAX_SNIPPETS_FETCH_ATTEMPTS} attempts`);
  }

  // Shuffle snippets and return them
  return snippets.sort(() => Math.random() - 0.5);
}

function processSnippets(fileContent: string, languageId: string): string[] {
  // Extract snippets from file content
  const extractedSnippets = extractSnippets(fileContent, languageId);

  // Format snippets
  let codeSnippets = extractedSnippets
    .map((snippet) => {
      const formattedSnippet = formatCode(snippet);

      if (!formattedSnippet) return null;

      return formattedSnippet;
    })
    .filter((snippet) => snippet !== null);

  // Filter snippets
  codeSnippets = filterSnippets(codeSnippets);

  return codeSnippets;
}

async function getSnippetsFromUrls(snippetUrls: string[], languageId: string): Promise<string[]> {
  const processSnippetsPromises = snippetUrls.map(async (snippetUrl: string) => {
    // Get file content from snippetUrl
    const fileContent = await getFileContent(snippetUrl);

    // Process snippets from file content
    const snippets = processSnippets(fileContent, languageId);

    if (snippets.length === 0) {
      // If after processing no snippets are found from that URL, async set it to NON VALID
      setSnippetAsNonValid(snippetUrl);
    }

    return snippets;
  });

  // Process snippets from all file contents simultaneously
  const processedSnippets = (await Promise.all(processSnippetsPromises)).flat();

  return processedSnippets;
}
