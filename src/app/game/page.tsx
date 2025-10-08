"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {getRandomCodeSnippets} from "@/features/snippets/services/get-random-snippets.client";
import {fetchLanguages} from "@/features/snippets/infrastructure/adapters/snippet-fetch.client";
import useStopwatch from "@/features/game/hooks/useStopwatch";
import {GameStatus} from "@/features/game/types/game-state";
import {REFRESH_BUTTON_MIN_DELAY, DEFAULT_LANGUAGE} from "@/features/game/config/game";
import {useGameStore} from "@/features/game/state/game-store";
import GameView from "@/features/game/components/game-view";
import EndgameView from "@/features/game/components/endgame-view";
import type {ILanguage} from "@/shared/types/language";

function Home() {
  const status = useGameStore((state) => state.status);
  const snippetQueue = useGameStore((state) => state.snippetQueue);
  const language = useGameStore((state) => state.language);
  const currentSnippet = useGameStore((state) => state.currentSnippet);
  const initialize = useGameStore((state) => state.initialize);
  const addSnippetsToQueue = useGameStore((state) => state.addSnippetsToQueue);
  const goToNextSnippet = useGameStore((state) => state.goToNextSnippet);
  const resetCurrentSnippet = useGameStore((state) => state.resetCurrentSnippet);
  const setStatus = useGameStore((state) => state.setStatus);

  const [elapsedTime, setElapsedTime] = useState(0);

  const onTick = useCallback((elapsedTime: number) => {
    setElapsedTime(elapsedTime);
  }, []);

  const {startStopwatch, stopStopwatch, resetStopwatch} = useStopwatch(onTick);

  const [isNextButtonLocked, setIsNextButtonLocked] = useState(false);

  const backgroundFetchPromise = useRef<Promise<void> | null>(null);
  const availableLanguages = useRef<{[key: string]: ILanguage} | null>(null);

  const setSnippets = useCallback(
    async (selectedLanguage: ILanguage) => {
      resetStopwatch();
      const snippets = await getRandomCodeSnippets(selectedLanguage.id);
      initialize(selectedLanguage, snippets);
    },
    [initialize, resetStopwatch]
  );

  const backgroundGetSnippets = async () => {
    const activeLanguage = language ?? availableLanguages.current?.[DEFAULT_LANGUAGE];
    if (!activeLanguage) return;

    const snippets = await getRandomCodeSnippets(activeLanguage.id);
    addSnippetsToQueue(snippets);
  };

  const goToNextSnippetWithPrefetch = async () => {
    if (status !== GameStatus.PLAYING && status !== GameStatus.READY && status !== GameStatus.FINISHED) return;

    const startTime = Date.now();
    setIsNextButtonLocked(true);

    if (snippetQueue.length === 0) {
      setStatus(GameStatus.LOADING);

      if (backgroundFetchPromise.current) {
        await backgroundFetchPromise.current;
        backgroundFetchPromise.current = null;
      } else {
        const fallbackLanguage = language ?? availableLanguages.current?.[DEFAULT_LANGUAGE];
        if (!fallbackLanguage) return;
        await setSnippets(fallbackLanguage);
        setIsNextButtonLocked(false);
        return;
      }
    } else if (snippetQueue.length <= 3 && !backgroundFetchPromise.current) {
      backgroundFetchPromise.current = backgroundGetSnippets();
    }

    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(REFRESH_BUTTON_MIN_DELAY - elapsedTime, 0);

    goToNextSnippet();

    setTimeout(() => {
      setIsNextButtonLocked(false);
    }, remainingTime);
  };

  const resetSnippet = () => {
    resetStopwatch();
    resetCurrentSnippet();
  };

  const handleStartGame = () => {
    startStopwatch();
  };

  const handleEndGame = useCallback(() => {
    stopStopwatch();
  }, [stopStopwatch]);

  const handleChangeSnippet = async () => {
    setStatus(GameStatus.LOADING);
    await goToNextSnippetWithPrefetch();
    resetStopwatch();
  };

  useEffect(() => {
    const initializeGame = async () => {
      const languages = await fetchLanguages();
      availableLanguages.current = languages;

      const defaultLanguage = languages[DEFAULT_LANGUAGE] ?? languages[Object.keys(languages)[0]];
      await setSnippets(defaultLanguage);
      resetStopwatch();
    };

    initializeGame();
  }, [setSnippets, resetStopwatch]);

  if (status === GameStatus.FINISHED && currentSnippet) {
    return <EndgameView totalTime={elapsedTime} handleRestartGame={handleChangeSnippet} />;
  }

  if (status === GameStatus.LOADING || !availableLanguages.current || !currentSnippet || !language) {
    return <div>Loading...</div>;
  }

  return (
    <GameView
      onGameFinished={handleEndGame}
      onGameStarted={handleStartGame}
      changeSnippet={handleChangeSnippet}
      resetSnippet={resetSnippet}
      changeLanguage={setSnippets}
      isRefreshing={isNextButtonLocked}
      availableLanguages={availableLanguages.current}
      elapsedTime={elapsedTime}
    />
  );
}

export default Home;
