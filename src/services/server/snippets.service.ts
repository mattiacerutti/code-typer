import { MIN_SNIPPETS_PER_LANGUAGE, MAX_SNIPPETS_FETCH_ATTEMPTS } from "@/constants/snippets.server";
import { fetchRandomSnippets, setSnippetAsNonValid } from "@/repositories/snippet.repository";
import { getFilesFromUrls } from "./snippet-fetch.service";
import { processSnippets as processFile } from "./snippet-process.service";

export async function getRandomSnippets(languageId: string, quantity: number): Promise<string[]> {
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

    // Get files from urls
    const fetchedFiles = await getFilesFromUrls(fileUrls);

    const extractedSnippets = fetchedFiles.map((file) => {
      const snippets = processFile(file.content, languageId);

      if (snippets.length === 0) {
        // If after processing no snippets are found from that URL, async set it to NON VALID
        if (process.env.NODE_ENV === "production") {
          setSnippetAsNonValid(file.url);
        }
      }

      return snippets;
    }).flat();

    // Process snippets from file content
    snippets.push(...extractedSnippets);
    attempts++;
  }

  if (snippets.length < MIN_SNIPPETS_PER_LANGUAGE) {
    throw new Error(`Failed to fetch enough snippets in ${MAX_SNIPPETS_FETCH_ATTEMPTS} attempts`);
  }

  // Shuffle snippets and return them
  return snippets.sort(() => Math.random() - 0.5);
}
