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

  return <GameStateContext.Provider value={{gameState: state, setSnippet, setLanguage}}>{children}</GameStateContext.Provider>;
}
