import {create} from "zustand";
import type {IParsedSnippet, IClientSnippet} from "@/features/shared/types/snippet";
import type {ILanguage} from "@/features/shared/types/language";
import {GameStatus} from "@/features/game/types/game-status";
import {resetCharacters} from "@/features/game/logic/game-logic";

export type SessionStats = {
  wrongKeystrokes: number;
  validKeystrokes: number;
  positionSamples: {time: number; position: number}[];
};

const createSessionStats = (): SessionStats => ({
  wrongKeystrokes: 0,
  validKeystrokes: 0,
  positionSamples: [],
});

export interface IGameStoreState {
  status: GameStatus;
  language: ILanguage | null;
  currentSnippet: IClientSnippet | null;
  userPosition: number | null;

  /* Methods */
  initialize: (language: ILanguage, snippets: IClientSnippet[]) => void;
  updateCurrentSnippet: (newSnippet: IParsedSnippet) => void;
  updateUserPosition: (position: number) => void;
  addSnippetsToQueue: (snippets: IClientSnippet[]) => void;
  goToNextSnippet: () => void;
  resetCurrentSnippet: () => void;
  setStatus: (status: GameStatus.LOADING | GameStatus.FINISHED) => void;
  incrementWrongKeystroke: () => void;
  incrementValidKeystroke: () => void;
  registerPositionSample: (time: number, position: number) => void;

  /* Getters for non-stateful properties */
  getSessionStats: () => SessionStats;
  getSnippetQueue: () => IClientSnippet[];
}

export const useGameStore = create<IGameStoreState>((set, get) => {
  let sessionStats = createSessionStats();
  let snippetQueue: IClientSnippet[] = [];

  const resetSessionStats = () => {
    sessionStats = createSessionStats();
  };

  return {
    status: GameStatus.LOADING,
    language: null,
    currentSnippet: null,
    userPosition: null,
    initialize: (language, snippets) => {
      if (snippets.length === 0) throw new Error("Cannot initialize game with empty snippets");

      resetSessionStats();

      const [currentSnippet, ...rest] = snippets;

      snippetQueue = [...rest];

      set({
        status: GameStatus.READY,
        language,
        currentSnippet,
        userPosition: 0,
      });
    },
    addSnippetsToQueue: (snippets) => {
      const language = get().language;
      if (!language) throw new Error("Cannot add snippets to queue when there is no selected language");
      if (snippets.length === 0) return;

      snippetQueue = [...snippetQueue, ...snippets];
    },
    goToNextSnippet: () => {
      if (snippetQueue.length === 0) throw new Error("Cannot go to next snippet when the queue is empty");
      const [nextSnippet, ...rest] = snippetQueue;

      snippetQueue = rest;
      resetSessionStats();

      set({
        status: GameStatus.READY,
        userPosition: 0,
        currentSnippet: nextSnippet,
      });
    },
    resetCurrentSnippet: () => {
      const currentSnippet = get().currentSnippet;
      if (!currentSnippet) return;

      resetSessionStats();
      set({
        status: GameStatus.READY,
        userPosition: 0,
        currentSnippet: resetCharacters(currentSnippet),
      });
    },
    updateCurrentSnippet: (newSnippet) => {
      const currentSnippet = get().currentSnippet;
      if (!currentSnippet) throw new Error("Cannot set current snippet when there is no current snippet. This function should only be used to update the snippet during a game.");

      set({
        status: GameStatus.PLAYING,
        currentSnippet: {
          rawSnippet: currentSnippet.rawSnippet,
          parsedSnippet: newSnippet,
        },
      });
    },
    updateUserPosition: (position) => {
      const userPosition = get().userPosition;
      if (userPosition === null)
        throw new Error("Cannot set user position when there is no current user position. This function should only be used to update the position during a game.");
      set({
        status: GameStatus.PLAYING,
        userPosition: position,
      });
    },
    setStatus: (status) => {
      if (status === GameStatus.LOADING) {
        set({
          status,
          userPosition: null,
          currentSnippet: null,
        });
        return;
      }

      set({status});
    },
    incrementWrongKeystroke: () => {
      if (get().status !== GameStatus.PLAYING) return;
      sessionStats.wrongKeystrokes += 1;
    },
    incrementValidKeystroke: () => {
      if (get().status !== GameStatus.PLAYING) return;
      sessionStats.validKeystrokes += 1;
    },
    registerPositionSample: (time: number, position: number) => {
      if (get().status !== GameStatus.PLAYING) return;
      sessionStats.positionSamples.push({time, position});
    },
    getSessionStats: () => structuredClone(sessionStats),
    getSnippetQueue: () => structuredClone(snippetQueue),
  };
});
