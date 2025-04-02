import {LanguageId} from "@/types/language"; // Import the LanguageName type from the appropriate module
import { ISnippet } from "./snippet";

export enum GameStatus {
  NotStarted = "NotStarted",
  Started = "Started",
  Finished = "Finished",
}

export interface IGameState {
  status: GameStatus;
  snippet: {
    text: string;
    parsedSnippet: ISnippet;
  } | null;
  language: LanguageId;
  wrongKeystrokes: number;
  validKeystrokes: number;
  userPosition: number;
}
