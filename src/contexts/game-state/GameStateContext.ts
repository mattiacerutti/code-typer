import {Languages} from "@/constants/supported-languages";
import {GameStatus, IGameState} from "@/types/game-state";
import {ITextLine} from "@/types/text-line";
import {DEFAULT_LANGUAGE} from "@/constants/constants";
import {createContext, useContext} from "react";

// Create a context
export const GameStateContext = createContext<{
  gameState: IGameState;
  caretRef: React.RefObject<{
    setCaretIndex: (lineIndex: number, charIndex: number) => void;
  } | null>;
  setSnippet: (snippet: string | null) => void;
  setLanguage: (language: Languages) => void;
  resetGameState: (invalidateSnippet?: boolean) => void;
  updateSnippetLines: (lines: ITextLine[]) => void;
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
