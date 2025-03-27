import {Languages} from "@/constants/supported-languages"; // Import the LanguageName type from the appropriate module
import {ITextLine} from "./text-line"; // Import the Line type from the appropriate module

export enum GameStatus {
  NotStarted = "NotStarted",
  Started = "Started",
  Finished = "Finished",
}

export interface IGameState {
  status: GameStatus;
  snippet: {
    text: string;
    lines: ITextLine[]; // Use the imported Line type here
  } | null;
  language: Languages;
  wrongKeystrokes: number;
  validKeystrokes: number;
  userPosition: {
    charIndex: number;
    lineIndex: number;
  } ;
}
