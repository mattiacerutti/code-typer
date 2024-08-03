import {LanguageName} from "./CodeLanguage";
import {ILine} from "./Line"; // Import the Line type from the appropriate module

export enum GameStatus {
  NotStarted = "NotStarted",
  Started = "Started",
  Finished = "Finished",
}

export interface IGameState {
  status: GameStatus;
  snippet: {
    text: string;
    lines: ILine[]; // Use the imported Line type here
  } | null;
  language: LanguageName;
  wrongKeystrokes: number;
  validKeystrokes: number;
  userPosition: {
    charIndex: number;
    lineIndex: number;
  } ;
}
