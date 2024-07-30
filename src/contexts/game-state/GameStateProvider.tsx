import {LanguageName} from "@/types/CodeLanguage";
import {GameStatus, IGameState} from "@/types/GameState";
import {DEFAULT_LANGUAGE} from "@/utils/constants";
import {useCallback, useState} from "react";
import {GameStateContext} from "./GameStateContext";

import {ReactNode} from "react";

export function GameStateProvider({children}: {children: ReactNode}) {
  const [state, setState] = useState<IGameState>({
    status: GameStatus.NotStarted,
    snippet: null,
    language: DEFAULT_LANGUAGE,
    wrongKeystrokes: 0,
    validKeystrokes: 0
  });

  const setSnippet = useCallback((snippet: string | null) => {
    setState((prevState) => ({
      ...prevState,
      snippet,
    }));
  }, []);

  const setLanguage = useCallback((language: LanguageName) => {
    setState((prevState) => ({
      ...prevState,
      language,
    }));
  }, []);

  const resetGameState = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      status: GameStatus.NotStarted,
      snippet: null,
      language: DEFAULT_LANGUAGE,
      wrongKeystrokes: 0,
      validKeystrokes: 0
    }));
  }, []);

  return <GameStateContext.Provider value={{gameState: state, setSnippet, setLanguage, resetGameState}}>{children}</GameStateContext.Provider>;
}
