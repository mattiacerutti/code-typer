import React from "react";
import {GameStatus, IGameState} from "@/types/game-state";
import {createContext, useContext} from "react";
import {IParsedSnippet, ISnippet} from "@/types/snippet";
import {LanguageId} from "@/types/language";
import {DEFAULT_LANGUAGE} from "@/constants/constants";

export type GameAction =
  | {type: "SET_SNIPPETS"; payload: {snippets: ISnippet[]; language: LanguageId}}
  | {type: "ADD_SNIPPETS_TO_QUEUE"; payload: {snippets: ISnippet[]}}
  | {type: "GO_TO_NEXT_SNIPPET"}
  | {type: "SET_LANGUAGE"; payload: LanguageId}
  | { type: "RESET_GAME_STATE" }
  | { type: "UPDATE_CURRENT_SNIPPET"; payload: IParsedSnippet }
  | { type: "UPDATE_USER_POSITION"; payload: number }
  | { type: "SET_GAME_STATUS"; payload: GameStatus };

export interface IGameStateContextType {
  state: IGameState;
  dispatch: React.Dispatch<GameAction>;
}

// Set up an initial game state
const initialState: IGameState = {
  status: GameStatus.LOADING,
  language: DEFAULT_LANGUAGE,
  snippetQueue: null,
};

// Create the context with default values
export const GameStateContext = createContext<IGameStateContextType>({
  state: initialState,
  dispatch: () => null,
});

// Custom hook for using the context
export const useGameState = () => useContext(GameStateContext);
