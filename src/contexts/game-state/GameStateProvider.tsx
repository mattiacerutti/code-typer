"use client";
import {Language} from "@/constants/supported-languages";
import {GameStatus, IGameState} from "@/types/game-state";
import {AUTO_CLOSING_CHARS, DEFAULT_LANGUAGE} from "@/constants/constants";
import {useCallback, useEffect, useRef, useState} from "react";
import {GameStateContext} from "./GameStateContext";

import {ReactNode} from "react";
import {parseSnippet} from "@/services/snippets/snippet-parse.service";
import {ICharacter} from "@/types/character";

export function GameStateProvider({children}: {children: ReactNode}) {
  const [state, setState] = useState<IGameState>({
    status: GameStatus.NotStarted,
    snippet: null,
    language: DEFAULT_LANGUAGE,
    wrongKeystrokes: 0,
    validKeystrokes: 0,
    userPosition: 0,
  });

  const caretRef = useRef<{
    setCaretIndex: (index: number) => void;
  }>(null);

  const setSnippet = useCallback((snippet: string | null) => {
    if (!snippet) {
      setState((prevState) => ({
        ...prevState,
        snippet: null,
      }));
      return;
    }

    const parsedText = parseSnippet(snippet, AUTO_CLOSING_CHARS);

    setState((prevState) => ({
      ...prevState,
      snippet: {
        text: snippet,
        parsedSnippet: parsedText,
      },
    }));
  }, []);

  const setLanguage = useCallback((language: Language) => {
    setState((prevState) => ({
      ...prevState,
      language,
    }));
  }, []);

  const resetGameState = useCallback((invalidateSnippet = true) => {
    if (invalidateSnippet) {
      setState((prevState) => ({
        ...prevState,
        status: GameStatus.NotStarted,
        snippet: null,
        wrongKeystrokes: 0,
        validKeystrokes: 0,
        userPosition: 0,
      }));
      return;
    }

    setState((prevState) => {
      if (!prevState.snippet) return prevState;

      return {
        ...prevState,
        status: GameStatus.NotStarted,
        wrongKeystrokes: 0,
        validKeystrokes: 0,
        snippet: {
          ...prevState.snippet,
          lines: parseSnippet(prevState.snippet.text, AUTO_CLOSING_CHARS),
        },
        userPosition: 0,
      };
    });

    if (caretRef.current) {
      caretRef.current.setCaretIndex(0);
    }
  }, []);

  const updateParsedSnippet = useCallback((parsedSnippet: ICharacter[]) => {
    setState((prevState) => {
      if (!prevState.snippet) throw "Can't update parsedSnippet if snippet is null";

      return {
        ...prevState,
        snippet: {
          ...prevState.snippet,
          parsedSnippet,
        },
      };
    });
  }, []);

  const updateUserPosition = useCallback((position: number) => {
    setState((prevState) => ({...prevState, userPosition: position}));
  }, []);

  useEffect(() => {
    caretRef.current?.setCaretIndex(state.userPosition);
  }, [state.userPosition]);

  return (
    <GameStateContext.Provider value={{gameState: state, caretRef, setSnippet, setLanguage, resetGameState, updateParsedSnippet, updateUserPosition}}>
      {children}
    </GameStateContext.Provider>
  );
}
