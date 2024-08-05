import {LanguageName} from "@lib/types/CodeLanguage";
import {GameStatus, IGameState} from "@/types/GameState";
import {AUTO_CLOSING_CHARS, DEFAULT_LANGUAGE} from "@/utils/constants";
import {useCallback, useEffect, useRef, useState} from "react";
import {GameStateContext} from "./GameStateContext";

import {ReactNode} from "react";
import {parseSnippet} from "@/services/snippets/snippet-parse.service";
import {ILine} from "@/types/Line";

export function GameStateProvider({children}: {children: ReactNode}) {
  const [state, setState] = useState<IGameState>({
    status: GameStatus.NotStarted,
    snippet: null,
    language: DEFAULT_LANGUAGE,
    wrongKeystrokes: 0,
    validKeystrokes: 0,
    userPosition: {charIndex: 0, lineIndex: 0},
  });

  const caretRef = useRef<{
    setCaretIndex: (lineIndex: number, charIndex: number) => void;
  }>(null);

  const setSnippet = useCallback((snippet: string | null) => {
    if (!snippet) {
      setState((prevState) => ({
        ...prevState,
        snippet: null,
      }));
      return;
    }

    const linesArray = parseSnippet(snippet, AUTO_CLOSING_CHARS);

    setState((prevState) => ({
      ...prevState,
      snippet: {
        text: snippet,
        lines: linesArray,
      },
    }));
  }, []);

  const setLanguage = useCallback((language: LanguageName) => {
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
        userPosition: {charIndex: 0, lineIndex: 0},
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
        userPosition: {charIndex: 0, lineIndex: 0},
      };
    });

    if (caretRef.current) {
      caretRef.current.setCaretIndex(0, 0);
    }
  }, []);

  const updateSnippetLines = useCallback((lines: ILine[]) => {
    setState((prevState) => {
      if (!prevState.snippet) throw "Can't update lines if snippet is null";

      return {
        ...prevState,
        snippet: {
          ...prevState.snippet,
          lines,
        },
      };
    });
  }, []);

  const updateUserPosition = useCallback((position: {charIndex?: number; lineIndex?: number}) => {
    setState((prevState) => {
      const newCharIndex = position.charIndex ?? prevState.userPosition.charIndex;
      const newLineIndex = position.lineIndex ?? prevState.userPosition.lineIndex;
      const userPosition = {charIndex: newCharIndex, lineIndex: newLineIndex};

      return {...prevState, userPosition};
    });
  }, []);

  useEffect(() => {
    caretRef.current?.setCaretIndex(state.userPosition.lineIndex, state.userPosition.charIndex);
  }, [state.userPosition]);

  return (
    <GameStateContext.Provider value={{gameState: state, caretRef, setSnippet, setLanguage, resetGameState, updateSnippetLines, updateUserPosition}}>
      {children}
    </GameStateContext.Provider>
  );
}
