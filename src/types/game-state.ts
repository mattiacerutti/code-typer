import {ISnippet} from "@/types/snippet";
import { LanguageId } from "@/types/language";

export enum GameStatus {
  LOADING = "LOADING",
  READY = "READY",
  PLAYING = "PLAYING",
  FINISHED = "FINISHED",
}

export interface IGameStateLoading {
  status: GameStatus.LOADING;
  language: LanguageId;
  snippetQueue: ISnippet[] | null;
}

export interface IGameStateReady {
  status: GameStatus.READY;
  snippetQueue: ISnippet[];
  currentSnippet: ISnippet;
  language: LanguageId;
  userPosition: number;
}

export interface IGameStatePlaying {
  status: GameStatus.PLAYING;
  snippetQueue: ISnippet[];
  currentSnippet: ISnippet;
  language: LanguageId;
  wrongKeystrokes: number;
  validKeystrokes: number;
  userPosition: number;
}

export interface IGameStateFinished {
  status: GameStatus.FINISHED;
  snippetQueue: ISnippet[];
  currentSnippet: ISnippet;
  language: LanguageId;
  wrongKeystrokes: number;
  validKeystrokes: number;
}

export type IGameState = IGameStateLoading | IGameStateReady | IGameStatePlaying | IGameStateFinished;
