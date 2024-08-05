import {LanguageName} from "@lib/types/CodeLanguage";
import {fetchRandomSnippets} from "./snippet-fetch.service";

export const getRandomCodeSnippets = async (language: LanguageName): Promise<string[]> => {
  return await fetchRandomSnippets(language);
};
