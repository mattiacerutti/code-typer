import type {IClientSnippet, IRawSnippet} from "@/features/shared/types/snippet";
import {parseSnippet} from "@/features/snippets/logic/parsing/snippet-parse.client";

export const buildClientSnippets = (rawSnippets: IRawSnippet[], autoClosingEnabled: boolean): IClientSnippet[] => {
  return rawSnippets
    .map((rawSnippet) => {
      const parsedSnippet = parseSnippet(rawSnippet, autoClosingEnabled);
      if (!parsedSnippet) {
        return null;
      }

      return {parsedSnippet, rawSnippet};
    })
    .filter((snippet): snippet is IClientSnippet => snippet !== null);
};
