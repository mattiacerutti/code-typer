import {MIN_SNIPPETS_PER_LANGUAGE, MAX_SNIPPETS_FETCH_ATTEMPTS, RANDOM_FILES_FETCHED} from "@/features/snippets/config/snippets.server";
import {ISnippet} from "@/shared/types/snippet.server";
import {filterSnippets} from "@/features/snippets/logic/processing/filter";
import {findRandomSnippets} from "@/features/snippets/infrastructure/repositories/snippet.repository.server";
import {extractAutoCompleteDisabledRanges} from "@/features/snippets/logic/parsing/snippet-parser.server";

export async function getRandomSnippets(languageId: string): Promise<ISnippet[]> {
  const snippets: ISnippet[] = [];

  let attempts = 0;
  while (snippets.length < MIN_SNIPPETS_PER_LANGUAGE && attempts < MAX_SNIPPETS_FETCH_ATTEMPTS) {
    const randomSnippets = await findRandomSnippets(languageId, RANDOM_FILES_FETCHED);

    const filteredSnippets = randomSnippets.filter((s) => filterSnippets(s.content));

    const finalSnippets = filteredSnippets.map((snippet) => {
      const disabledRanges = extractAutoCompleteDisabledRanges(snippet.content, languageId);

      return {
        content: snippet.content,
        disabledRanges,
      };
    });

    snippets.push(...finalSnippets);

    attempts++;
  }

  if (snippets.length < MIN_SNIPPETS_PER_LANGUAGE) {
    throw new Error(`Failed to fetch enough snippets in ${MAX_SNIPPETS_FETCH_ATTEMPTS} attempts`);
  }

  return snippets.sort(() => Math.random() - 0.5);
}
