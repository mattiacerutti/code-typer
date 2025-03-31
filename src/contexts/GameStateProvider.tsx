"use client";
import React, {useReducer, ReactNode} from "react";
import {GameStateContext, GameAction} from "./GameStateContext";
import {GameStatus, IGameState} from "@/types/game-state";
import {DEFAULT_LANGUAGE, AUTO_CLOSING_CHARS} from "@/constants/constants";
import {parseSnippet} from "@/services/snippets/snippet-parse.service";

const initialState: IGameState = {
  status: GameStatus.NotStarted,
  snippet: null,
  language: DEFAULT_LANGUAGE,
  wrongKeystrokes: 0,
  validKeystrokes: 0,
  userPosition: 0,
};

function stateReducer(state: IGameState, action: GameAction): IGameState {
  switch (action.type) {
    case "SET_SNIPPET":
      const parsedText = parseSnippet(action.payload, AUTO_CLOSING_CHARS);
      return {
        ...state,
        snippet: {
          text: action.payload,
          parsedSnippet: parsedText,
        },
      };

    case "SET_LANGUAGE":
      return {
        ...state,
        language: action.payload,
      };

    case "RESET_GAME_STATE":
      if (action.keepSnippet === false && state.snippet) {
        return {
          ...state,
          status: GameStatus.NotStarted,
          snippet: {
            ...state.snippet,
            parsedSnippet: parseSnippet(state.snippet.text, AUTO_CLOSING_CHARS),
          },
          wrongKeystrokes: 0,
          validKeystrokes: 0,
          userPosition: 0,
        };
      }
      return {
        ...state,
        status: GameStatus.NotStarted,
        snippet: null,
        wrongKeystrokes: 0,
        validKeystrokes: 0,
        userPosition: 0,
      };

    case "UPDATE_PARSED_SNIPPET":
      if (!state.snippet) {
        throw new Error("Can't update parsedSnippet if snippet is null");
      }
      return {
        ...state,
        snippet: {
          ...state.snippet,
          parsedSnippet: action.payload,
        },
      };

    case "UPDATE_USER_POSITION":
      return {
        ...state,
        userPosition: action.payload,
      };

    case "UPDATE_STATUS":
      return {
        ...state,
        status: action.payload,
      };

    default:
      throw new Error("GameState reducer received an invalid action");
  }
}

export function GameStateProvider({children}: {children: ReactNode}) {
  const [state, dispatch] = useReducer(stateReducer, initialState);

  return <GameStateContext.Provider value={{state, dispatch}}>{children}</GameStateContext.Provider>;
}
