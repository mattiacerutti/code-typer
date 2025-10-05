import {MIN_SNIPPETS_PER_LANGUAGE, MAX_SNIPPETS_FETCH_ATTEMPTS, RANDOM_FILES_FETCHED} from "@/features/snippets/config/snippets.server";
import {fetchRandomFiles as getRandomFiles, setSnippetAsNonValid} from "@/features/snippets/infrastructure/repositories/snippet.repository.server";
import {getFilesFromUrls} from "@/features/snippets/infrastructure/adapters/snippet-fetch.server";
import {processSnippets as processFile} from "@/features/snippets/logic/processing/snippet-process.server";
import type {SnippetSourceFile} from "@/features/snippets/types/snippet-source";
import {ISnippet} from "@/shared/types/snippet.server";
import {isDev} from "@/core/config/env";

export async function getRandomSnippets(languageId: string): Promise<ISnippet[]> {
  const snippets: ISnippet[] = [];
  const fetchedFilesUrls: string[] = [];

  let attempts = 0;
  while (snippets.length < MIN_SNIPPETS_PER_LANGUAGE && attempts < MAX_SNIPPETS_FETCH_ATTEMPTS) {
    const fileUrls = await getRandomFiles(languageId, RANDOM_FILES_FETCHED, fetchedFilesUrls).catch((error) => {
      console.error("Error fetching random files:", error);
      return [];
    });

    fetchedFilesUrls.push(...fileUrls);

    const fetchedFiles: SnippetSourceFile[] = await getFilesFromUrls(fileUrls);

    const extractedSnippets = fetchedFiles
      .map((file) => {
        const snippetsFromFile = processFile(file.content, languageId);

        if (snippetsFromFile.length === 0 && !isDev) {
          setSnippetAsNonValid(file.url);
        }

        return snippetsFromFile;
      })
      .flat();

    snippets.push(...extractedSnippets);
    attempts++;
  }

  if (snippets.length < MIN_SNIPPETS_PER_LANGUAGE) {
    throw new Error(`Failed to fetch enough snippets in ${MAX_SNIPPETS_FETCH_ATTEMPTS} attempts`);
  }

  return snippets.sort(() => Math.random() - 0.5);
}
