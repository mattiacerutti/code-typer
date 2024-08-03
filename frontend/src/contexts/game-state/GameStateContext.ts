import {LanguageName} from "@/types/CodeLanguage";
import {GameStatus, IGameState} from "@/types/GameState";
import {ILine} from "@/types/Line";
import {DEFAULT_LANGUAGE} from "@/utils/constants";
import {createContext, useContext} from "react";

// Create a context
export const GameStateContext = createContext<{
  gameState: IGameState;
  caretRef: React.RefObject<{
    setCaretIndex: (lineIndex: number, charIndex: number) => void;
  }>;
  setSnippet: (snippet: string | null) => void;
  setLanguage: (language: LanguageName) => void;
  resetGameState: (invalidateSnippet?: boolean) => void;
  updateSnippetLines: (lines: ILine[]) => void;
  updateUserPosition: (position: {charIndex?: number; lineIndex?: number}) => void;
}>({
  gameState: {
    status: GameStatus.NotStarted,
    snippet: null,
    language: DEFAULT_LANGUAGE,
    wrongKeystrokes: 0,
    validKeystrokes: 0,
    userPosition: {charIndex: 0, lineIndex: 0} ,
  },
  caretRef: {current: null},
  setSnippet: () => {},
  setLanguage: () => {},
  resetGameState: () => {},
  updateSnippetLines: () => {},
  updateUserPosition: () => {},
});

export const useGameState = () => useContext(GameStateContext);
