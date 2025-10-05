import {ISnippet} from "@/shared/types/snippet";
import {ILanguage} from "@/shared/types/language";

export enum GameStatus {
  LOADING = "LOADING",
  READY = "READY",
  PLAYING = "PLAYING",
  FINISHED = "FINISHED",
}

export interface IGameStateLoading {
  status: GameStatus.LOADING;
  language: ILanguage | null;
  snippetQueue: ISnippet[] | null;
}

export interface IGameStateReady {
  status: GameStatus.READY;
  snippetQueue: ISnippet[];
  currentSnippet: ISnippet;
  language: ILanguage;
  userPosition: number;
}

export interface IGameStatePlaying {
  status: GameStatus.PLAYING;
  snippetQueue: ISnippet[];
  currentSnippet: ISnippet;
  language: ILanguage;
  wrongKeystrokes: number;
  validKeystrokes: number;
  userPosition: number;
}

export interface IGameStateFinished {
  status: GameStatus.FINISHED;
  snippetQueue: ISnippet[];
  currentSnippet: ISnippet;
  language: ILanguage;
  wrongKeystrokes: number;
  validKeystrokes: number;
}

export type IGameState = IGameStateLoading | IGameStateReady | IGameStatePlaying | IGameStateFinished;
