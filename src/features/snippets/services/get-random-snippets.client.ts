import {ISnippet} from "@/shared/types/snippet";
import {fetchRandomSnippets} from "@/features/snippets/infrastructure/adapters/snippet-fetch.client";
import {parseSnippet} from "@/features/snippets/logic/parsing/snippet-parse.client";

export const getRandomCodeSnippets = async (languageId: string): Promise<ISnippet[]> => {
  const rawSnippets = await fetchRandomSnippets(languageId);
  return rawSnippets
    .map((rawSnippet) => {
      const parsedSnippet = parseSnippet(rawSnippet);
      if (!parsedSnippet) {
        return null;
      }
      return {text: rawSnippet.content, parsedSnippet};
    })
    .filter((snippet): snippet is ISnippet => snippet !== null);
};
