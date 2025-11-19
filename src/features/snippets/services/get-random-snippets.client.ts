import type {ISnippet as IClientSnippet} from "@/shared/types/snippet";
import type {ISnippet as IServerSnippet} from "@/shared/types/snippet.server";
import {parseSnippet} from "@/features/snippets/logic/parsing/snippet-parse.client";

export const buildClientSnippet = (rawSnippet: IServerSnippet, autoClosingEnabled: boolean): IClientSnippet | null => {
  const parsedSnippet = parseSnippet(rawSnippet, autoClosingEnabled);
  if (!parsedSnippet) {
    return null;
  }

  return {parsedSnippet, rawSnippet};
};

export const buildClientSnippets = (rawSnippets: IServerSnippet[], autoClosingEnabled: boolean): IClientSnippet[] => {
  return rawSnippets.map((rawSnippet) => buildClientSnippet(rawSnippet, autoClosingEnabled)).filter((snippet): snippet is IClientSnippet => snippet !== null);
};
