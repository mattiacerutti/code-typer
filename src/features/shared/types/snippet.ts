import {ICharacter} from "@/features/shared/types/character";

export type IParsedSnippet = ICharacter[];

export interface IRawSnippet {
  id: string;
  content: string;
  disabledRanges: {startIndex: number; endIndex: number}[];
}

export interface IClientSnippet {
  parsedSnippet: IParsedSnippet;
  rawSnippet: IRawSnippet;
}
