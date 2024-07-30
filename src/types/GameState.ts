import { LanguageName } from "./CodeLanguage";

export enum GameStatus {
  NotStarted = "NotStarted",
  Started = "Started",
  Finished = "Finished",
}


export interface IGameState {
  status: GameStatus,
  snippet: string | null,
  language: LanguageName,
}