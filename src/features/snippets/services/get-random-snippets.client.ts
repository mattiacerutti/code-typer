import type {ISnippet as IClientSnippet} from "@/shared/types/snippet";
import type {ISnippet as IServerSnippet} from "@/shared/types/snippet.server";
import {fetchRandomSnippets} from "@/features/snippets/infrastructure/adapters/snippet-fetch.client";
import {parseSnippet} from "@/features/snippets/logic/parsing/snippet-parse.client";

export const buildClientSnippet = (rawSnippet: IServerSnippet, autoClosingEnabled: boolean): IClientSnippet | null => {
  const parsedSnippet = parseSnippet(rawSnippet, autoClosingEnabled);
  if (!parsedSnippet) {
    return null;
  }

  return {text: rawSnippet.content, parsedSnippet, rawSnippet};
};

export const getRandomCodeSnippets = async (languageId: string, autoClosingEnabled: boolean): Promise<IClientSnippet[]> => {
  const rawSnippets = await fetchRandomSnippets(languageId);
  return rawSnippets
    .map((rawSnippet) => buildClientSnippet(rawSnippet, autoClosingEnabled))
    .filter((snippet): snippet is IClientSnippet => snippet !== null);
};
