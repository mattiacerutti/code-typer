import {fetchRandomSnippets} from "./snippet-fetch.service";
import { LanguageId } from "@/types/language";

export const getRandomCodeSnippets = async (languageId: LanguageId): Promise<string[]> => {
  return await fetchRandomSnippets(languageId);
};

