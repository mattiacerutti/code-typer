import {Languages} from "@/constants/supported-languages";
import {fetchRandomSnippets} from "./snippet-fetch.service";

export const getRandomCodeSnippets = async (language: Languages): Promise<string[]> => {
  return await fetchRandomSnippets(language);
};
