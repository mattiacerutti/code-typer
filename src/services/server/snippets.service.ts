import {MIN_SNIPPETS_PER_LANGUAGE, MAX_SNIPPETS_FETCH_ATTEMPTS} from "@/constants/snippets.server";
import {RANDOM_FILES_FETCHED} from "@/constants/snippets.server";

import {fetchRandomFiles as getRandomFiles, setSnippetAsNonValid} from "@/repositories/snippet.repository";
import {getFilesFromUrls} from "./snippet-fetch.service";
import {processSnippets as processFile} from "./snippet-process.service";
import {ISnippet} from "@/types/server/snippet";
import {isDev} from "@/constants/env";
export async function getRandomSnippets(languageId: string): Promise<ISnippet[]> {
  const snippets: ISnippet[] = [];
  const fetchedFilesUrls: string[] = [];

  let attempts = 0;
  while (snippets.length < MIN_SNIPPETS_PER_LANGUAGE && attempts < MAX_SNIPPETS_FETCH_ATTEMPTS) {
    // Fetch n random snippetUrls from DB
    const fileUrls = await getRandomFiles(languageId, RANDOM_FILES_FETCHED, fetchedFilesUrls).catch((error) => {
      console.error("Error fetching random files:", error);
      return [];
    });

    // Add fileUrls to fetchedUrls array
    fetchedFilesUrls.push(...fileUrls);

    // Get files from urls
    const fetchedFiles = await getFilesFromUrls(fileUrls);

    const extractedSnippets = fetchedFiles
      .map((file) => {
        const snippets = processFile(file.content, languageId);

        if (snippets.length === 0) {
          // If after processing no snippets are found from that URL, async set it to NON VALID
          if (!isDev) {
            setSnippetAsNonValid(file.url);
          }
        }

        return snippets;
      })
      .flat();

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
