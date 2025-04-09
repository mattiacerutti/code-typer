import {ISnippet} from "@/types/snippet";
import {fetchRandomSnippets} from "./snippet-fetch.service";
import {parseSnippet} from "./snippet-parse.service";

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
    .filter((snippet) => snippet !== null);
};
