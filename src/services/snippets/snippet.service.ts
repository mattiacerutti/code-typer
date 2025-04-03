import { ISnippet } from "@/types/snippet";
import {fetchRandomSnippets} from "./snippet-fetch.service";
import { LanguageId } from "@/types/language";
import { parseSnippet } from "./snippet-parse.service";

export const getRandomCodeSnippets = async (languageId: LanguageId): Promise<ISnippet[]> => {
  const rawSnippets = await fetchRandomSnippets(languageId);
  return rawSnippets.map((rawSnippet) => {
    const parsedSnippet = parseSnippet(rawSnippet);
    return {text: rawSnippet, parsedSnippet};
  });
};

