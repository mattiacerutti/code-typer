import {ICharacter} from "@/features/shared/types/character";
import type {ISnippet as IServerSnippet} from "@/features/shared/types/snippet.server";

export type IParsedSnippet = ICharacter[];

export interface ISnippet {
  parsedSnippet: IParsedSnippet;
  rawSnippet: IServerSnippet;
}
