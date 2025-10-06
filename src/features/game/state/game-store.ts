import {create} from "zustand";
import {CharacterState} from "@/shared/types/character";
import type {IParsedSnippet, ISnippet} from "@/shared/types/snippet";
import type {ILanguage} from "@/shared/types/language";
import {GameStatus} from "@/features/game/types/game-state";

export interface IGameStoreState {
  status: GameStatus;
  language: ILanguage | null;
  snippetQueue: ISnippet[];
  currentSnippet: ISnippet | null;
  userPosition: number;
  wrongKeystrokes: number;
  validKeystrokes: number;
  initialize: (language: ILanguage, snippets: ISnippet[]) => void;
  addSnippetsToQueue: (snippets: ISnippet[]) => void;
  goToNextSnippet: () => void;
  resetCurrentSnippet: () => void;
  setParsedSnippet: (parsedSnippet: IParsedSnippet) => void;
  setUserPosition: (position: number) => void;
  setStatus: (status: GameStatus) => void;
  incrementWrongKeystroke: () => void;
  incrementValidKeystroke: () => void;
}

function resetCharacters(snippet: ISnippet): ISnippet {
  return {
    text: snippet.text,
    parsedSnippet: snippet.parsedSnippet.map((char) => ({
      ...char,
      state: CharacterState.Default,
    })),
  };
}

export const useGameStore = create<IGameStoreState>((set, get) => ({
  status: GameStatus.LOADING,
  language: null,
  snippetQueue: [],
  currentSnippet: null,
  userPosition: 0,
  wrongKeystrokes: 0,
  validKeystrokes: 0,
  initialize: (language, snippets) => {
    if (snippets.length === 0) {
      set({
        status: GameStatus.LOADING,
        language,
        snippetQueue: [],
        currentSnippet: null,
        userPosition: 0,
        wrongKeystrokes: 0,
        validKeystrokes: 0,
      });
      return;
    }

    const [currentSnippet, ...snippetQueue] = snippets;
    set({
      status: GameStatus.READY,
      language,
      currentSnippet,
      snippetQueue,
      userPosition: 0,
      wrongKeystrokes: 0,
      validKeystrokes: 0,
    });
  },
  addSnippetsToQueue: (snippets) => {
    set((state) => ({
      snippetQueue: [...state.snippetQueue, ...snippets],
    }));
  },
  goToNextSnippet: () => {
    const {snippetQueue} = get();
    if (snippetQueue.length === 0) {
      return;
    }

    const [nextSnippet, ...rest] = snippetQueue;
    set({
      status: GameStatus.READY,
      currentSnippet: nextSnippet,
      snippetQueue: rest,
      userPosition: 0,
      wrongKeystrokes: 0,
      validKeystrokes: 0,
    });
  },
  resetCurrentSnippet: () => {
    const {currentSnippet} = get();
    if (!currentSnippet) {
      return;
    }

    set({
      status: GameStatus.READY,
      currentSnippet: resetCharacters(currentSnippet),
      userPosition: 0,
      wrongKeystrokes: 0,
      validKeystrokes: 0,
    });
  },
  setParsedSnippet: (parsedSnippet) => {
    const {currentSnippet, status, wrongKeystrokes, validKeystrokes} = get();
    if (!currentSnippet) {
      return;
    }

    set({
      status: GameStatus.PLAYING,
      currentSnippet: {
        text: currentSnippet.text,
        parsedSnippet,
      },
      wrongKeystrokes: status === GameStatus.PLAYING ? wrongKeystrokes : 0,
      validKeystrokes: status === GameStatus.PLAYING ? validKeystrokes : 0,
    });
  },
  setUserPosition: (position) => {
    const {status, wrongKeystrokes, validKeystrokes} = get();
    set({
      status: GameStatus.PLAYING,
      userPosition: position,
      wrongKeystrokes: status === GameStatus.PLAYING ? wrongKeystrokes : 0,
      validKeystrokes: status === GameStatus.PLAYING ? validKeystrokes : 0,
    });
  },
  setStatus: (status) => {
    if (status === GameStatus.READY) {
      set({status, userPosition: 0});
      return;
    }

    set({status});
  },
  incrementWrongKeystroke: () => {
    if (get().status !== GameStatus.PLAYING) return;
    const store = get();
    store.wrongKeystrokes += 1;
  },
  incrementValidKeystroke: () => {
    if (get().status !== GameStatus.PLAYING) return;
    const store = get();
    store.validKeystrokes += 1;
  },
}));
