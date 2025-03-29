import {Language} from "@/constants/supported-languages";
import {GameStatus, IGameState} from "@/types/game-state";
import {DEFAULT_LANGUAGE} from "@/constants/constants";
import {createContext, useContext} from "react";
import {ICharacter} from "@/types/character";
// Create a context
export const GameStateContext = createContext<{
  gameState: IGameState;
  caretRef: React.RefObject<{
    setCaretIndex: (position: number) => void;
  } | null>;
  setSnippet: (snippet: string | null) => void;
  setLanguage: (language: Language) => void;
  resetGameState: (invalidateSnippet?: boolean) => void;
  updateParsedSnippet: (parsedSnippet: ICharacter[]) => void;
  updateUserPosition: (position: number) => void;
}>({
  gameState: {
    status: GameStatus.NotStarted,
    snippet: null,
    language: DEFAULT_LANGUAGE,
    wrongKeystrokes: 0,
    validKeystrokes: 0,
    userPosition: 0,
  },
  caretRef: {current: null},
  setSnippet: () => {},
  setLanguage: () => {},
  resetGameState: () => {},
  updateParsedSnippet: () => {},
  updateUserPosition: () => {},
});

export const useGameState = () => useContext(GameStateContext);
