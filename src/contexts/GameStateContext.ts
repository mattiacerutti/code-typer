import React from "react";
import {Language} from "@/constants/supported-languages";
import {GameStatus, IGameState} from "@/types/game-state";
import {DEFAULT_LANGUAGE} from "@/constants/constants";
import {createContext, useContext} from "react";
import { ISnippet } from "@/types/snippet";

export type GameAction =
  | { type: "SET_SNIPPET"; payload: string }
  | { type: "SET_LANGUAGE"; payload: Language }
  | { type: "RESET_GAME_STATE"; keepSnippet: boolean }
  | { type: "UPDATE_PARSED_SNIPPET"; payload: ISnippet }
  | { type: "UPDATE_USER_POSITION"; payload: number }
  | { type: "UPDATE_STATUS"; payload: GameStatus };

export interface IGameStateContextType {
  state: IGameState;
  dispatch: React.Dispatch<GameAction>;
}

// Set up an initial game state
const initialState: IGameState = {
  status: GameStatus.NotStarted,
  snippet: null,
  language: DEFAULT_LANGUAGE,
  wrongKeystrokes: 0,
  validKeystrokes: 0,
  userPosition: 0,
};

// Create the context with default values
export const GameStateContext = createContext<IGameStateContextType>({
  state: initialState,
  dispatch: () => null,
});

// Custom hook for using the context
export const useGameState = () => useContext(GameStateContext);
