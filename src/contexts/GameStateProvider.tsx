"use client";
import React, {useReducer, ReactNode} from "react";
import {GameStateContext, GameAction} from "./GameStateContext";
import {GameStatus, IGameState, IGameStatePlaying} from "@/types/game-state";
import {DEFAULT_LANGUAGE} from "@/constants/constants";
import {CharacterState} from "@/types/character";

const initialState: IGameState = {
  status: GameStatus.LOADING,
  language: DEFAULT_LANGUAGE,
  snippetQueue: null,
};

function stateReducer(state: IGameState, action: GameAction): IGameState {
  switch (action.type) {
    case "SET_SNIPPETS":
      const snippets = action.payload.snippets;

      const [currentSnippet, ...queue] = snippets;

      return {
        status: GameStatus.READY,
        snippetQueue: queue,
        currentSnippet: currentSnippet,
        language: action.payload.language,
        userPosition: 0,
      };

    case "ADD_SNIPPETS_TO_QUEUE":
      if (state.status !== GameStatus.PLAYING && state.status !== GameStatus.READY && state.status !== GameStatus.LOADING) {
        throw new Error(`ADD_SNIPPETS_TO_QUEUE called with status ${state.status}, this should not happen`);
      }

      if (!state.snippetQueue){
        return {
          ...state,
          snippetQueue: action.payload.snippets,
        };
      }

      return {
        ...state,
        snippetQueue: [...state.snippetQueue, ...action.payload.snippets],
      };

    case "GO_TO_NEXT_SNIPPET":
      if (state.status !== GameStatus.PLAYING && state.status !== GameStatus.READY && state.status !== GameStatus.LOADING) {
        throw new Error(`GO_TO_NEXT_SNIPPET called with status ${state.status}, this should not happen`);
      }

      if (!state.snippetQueue || state.snippetQueue.length === 0) throw new Error("GO_TO_NEXT_SNIPPET called with no snippet queue");

      const [nextSnippet, ...newSnippetQueue] = state.snippetQueue;

      return {
        status: GameStatus.READY,
        snippetQueue: newSnippetQueue,
        currentSnippet: nextSnippet,
        language: state.language,
        userPosition: 0,
      };

    case "SET_LANGUAGE":
      if (state.status !== GameStatus.READY && state.status !== GameStatus.PLAYING) {
        throw new Error("Cannot set language if game is not in READY or PLAYING state");
      }

      return {
        ...state,
        language: action.payload,
      };

    case "RESET_GAME_STATE":
      if (state.status !== GameStatus.PLAYING) {
        throw new Error("Cannot reset game state if game is not in PLAYING state");
      }

      const resetSnippet = {
        text: state.currentSnippet.text,
        parsedSnippet: state.currentSnippet.parsedSnippet.map((char) => ({
          ...char,
          state: CharacterState.Default,
        })),
      };

      return {
        ...state,
        status: GameStatus.READY,
        snippetQueue: state.snippetQueue,
        currentSnippet: resetSnippet,
        language: state.language,
        userPosition: 0,
      };

    case "UPDATE_CURRENT_SNIPPET":
      if (state.status !== GameStatus.PLAYING && state.status !== GameStatus.READY) {
        throw new Error("Cannot update current snippet if game is not in PLAYING or READY state");
      }

      return {
        status: GameStatus.PLAYING,
        currentSnippet: {
          text: state.currentSnippet.text,
          parsedSnippet: action.payload,
        },
        snippetQueue: state.snippetQueue,
        language: state.language,
        wrongKeystrokes: state.status === GameStatus.PLAYING ? (state as IGameStatePlaying).wrongKeystrokes : 0,
        validKeystrokes: state.status === GameStatus.PLAYING ? (state as IGameStatePlaying).validKeystrokes : 0,
        userPosition: state.userPosition,
      };

    case "UPDATE_USER_POSITION":
      if (state.status !== GameStatus.PLAYING && state.status !== GameStatus.READY) {
        throw new Error("Cannot update user position if game is not in PLAYING or READY state");
      }

      return {
        status: GameStatus.PLAYING,
        currentSnippet: state.currentSnippet,
        snippetQueue: state.snippetQueue,
        language: state.language,
        wrongKeystrokes: state.status === GameStatus.PLAYING ? (state as IGameStatePlaying).wrongKeystrokes : 0,
        validKeystrokes: state.status === GameStatus.PLAYING ? (state as IGameStatePlaying).validKeystrokes : 0,
        userPosition: action.payload,
      };

    case "SET_GAME_STATUS":
      if (action.payload === GameStatus.LOADING) {
        return {
          status: action.payload,
          language: state.language,
          snippetQueue: state.snippetQueue,
        };
      }

      if (state.status === GameStatus.PLAYING) {
        switch (action.payload) {
          case GameStatus.READY:
            return {
              status: action.payload,
              snippetQueue: state.snippetQueue,
              currentSnippet: state.currentSnippet,
              language: state.language,
              userPosition: state.userPosition,
            };
          case GameStatus.FINISHED:
            return {
              status: action.payload,
              snippetQueue: state.snippetQueue,
              currentSnippet: state.currentSnippet,
              language: state.language,
              wrongKeystrokes: state.wrongKeystrokes,
              validKeystrokes: state.validKeystrokes,
            };
        }
      }

      if (state.status === GameStatus.FINISHED) {
        switch (action.payload) {
          case GameStatus.READY:
            return {
              status: action.payload,
              language: state.language,
              snippetQueue: state.snippetQueue,
              currentSnippet: state.currentSnippet,
              userPosition: 0,
            };
        }
      }

      console.warn(`SET_GAME_STATUS with payload ${action.payload} called with status ${state.status}, this should not happen.`);
      return state;

    default:
      throw new Error("GameState reducer received an invalid action");
  }
}

export function GameStateProvider({children}: {children: ReactNode}) {
  const [state, dispatch] = useReducer(stateReducer, initialState);

  return <GameStateContext.Provider value={{state, dispatch}}>{children}</GameStateContext.Provider>;
}
