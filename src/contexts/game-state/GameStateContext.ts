import { LanguageName } from "@/types/CodeLanguage";
import { GameStatus, IGameState } from "@/types/GameState";
import { DEFAULT_LANGUAGE } from "@/utils/constants";
import { createContext, useContext } from "react";

// Create a context
export const GameStateContext = createContext<{
  gameState: IGameState;
  setSnippet: (snippet: string | null) => void;
  setLanguage: (language: LanguageName) => void;
}>({
  gameState: {
    status: GameStatus.NotStarted,
    snippet: null,
    language: DEFAULT_LANGUAGE,
  },
  setSnippet: () => {},
  setLanguage: () => {},
});

export const useGameState = () => useContext(GameStateContext);
