import {ICharacter} from "@/shared/types/character";
import type {ISnippet as IServerSnippet} from "@/shared/types/snippet.server";

export type IParsedSnippet = ICharacter[];

export interface ISnippet {
  parsedSnippet: IParsedSnippet;
  rawSnippet: IServerSnippet;
}
