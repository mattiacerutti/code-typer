import React from "react";
import {GameStatus, IGameState} from "@/features/game/types/game-state";
import {createContext, useContext} from "react";
import {IParsedSnippet, ISnippet} from "@/shared/types/snippet";
import {ILanguage} from "@/shared/types/language";

export type GameAction =
  | {type: "SET_SNIPPETS"; payload: {snippets: ISnippet[]; language: ILanguage}}
  | {type: "ADD_SNIPPETS_TO_QUEUE"; payload: {snippets: ISnippet[]}}
  | {type: "GO_TO_NEXT_SNIPPET"}
  | {type: "RESET_GAME_STATE"}
  | {type: "UPDATE_CURRENT_SNIPPET"; payload: IParsedSnippet}
  | {type: "UPDATE_USER_POSITION"; payload: number}
  | {type: "SET_GAME_STATUS"; payload: GameStatus};

export interface IGameStateContextType {
  state: IGameState;
  dispatch: React.Dispatch<GameAction>;
}

// Set up an initial game state
const initialState: IGameState = {
  status: GameStatus.LOADING,
  language: null,
  snippetQueue: null,
};

// Create the context with default values
export const GameStateContext = createContext<IGameStateContextType>({
  state: initialState,
  dispatch: () => null,
});

// Custom hook for using the context
export const useGameState = () => useContext(GameStateContext);
