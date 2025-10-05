import {ICharacter} from "@/shared/types/character";

export type IParsedSnippet = ICharacter[];

export interface ISnippet {
  text: string;
  parsedSnippet: IParsedSnippet;
}
