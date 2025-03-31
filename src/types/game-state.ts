import {Language} from "@/constants/supported-languages"; // Import the LanguageName type from the appropriate module
import {ICharacter} from "@/types/character";

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
  language: Language;
  wrongKeystrokes: number;
  validKeystrokes: number;
  userPosition: number;
}
