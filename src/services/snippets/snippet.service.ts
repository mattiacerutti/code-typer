import {Language} from "@/constants/supported-languages";
import {fetchRandomSnippets} from "./snippet-fetch.service";

export const getRandomCodeSnippets = async (language: Language): Promise<string[]> => {
  return await fetchRandomSnippets(language);
};
