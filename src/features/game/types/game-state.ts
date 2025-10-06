import type {IParsedSnippet, ISnippet} from "@/shared/types/snippet";
import type {ILanguage} from "@/shared/types/language";

export enum GameStatus {
  LOADING = "LOADING",
  READY = "READY",
  PLAYING = "PLAYING",
  FINISHED = "FINISHED",
}

export interface IGameSnapshot {
  status: GameStatus;
  language: ILanguage;
  currentSnippet: ISnippet;
  userPosition: number;
  wrongKeystrokes: number;
  validKeystrokes: number;
}

export interface IGameActions {
  setStatus: (status: GameStatus) => void;
  setParsedSnippet: (parsedSnippet: IParsedSnippet) => void;
  setUserPosition: (position: number) => void;
  incrementWrongKeystroke: () => void;
  incrementValidKeystroke: () => void;
}
