import {ISnippet} from "@/shared/types/snippet.server";
import {filterSnippets} from "@/features/snippets/logic/filter";
import {findRandomSnippets} from "@/features/snippets/infrastructure/repositories/snippet.repository.server";
import {extractAutoCompleteDisabledRanges} from "@/features/snippets/logic/parsing/snippet-parser.server";
import {MAX_GET_SNIPPETS_ATTEMPTS, MIN_SNIPPETS_NUMBER, SNIPPETS_RETRIEVED_PER_QUERY} from "@/features/snippets/config/snippets.server";

export async function getRandomSnippets(languageId: string): Promise<ISnippet[]> {
  const snippets: ISnippet[] = [];

  let attempts = 0;
  while (snippets.length < MIN_SNIPPETS_NUMBER && attempts < MAX_GET_SNIPPETS_ATTEMPTS) {
    const randomSnippets = await findRandomSnippets(languageId, SNIPPETS_RETRIEVED_PER_QUERY);

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

  if (snippets.length < MIN_SNIPPETS_NUMBER) {
    throw new Error(`Failed to fetch enough snippets in ${MAX_GET_SNIPPETS_ATTEMPTS} attempts`);
  }

  return snippets.sort(() => Math.random() - 0.5);
}
