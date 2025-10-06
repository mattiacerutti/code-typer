"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {getRandomCodeSnippets} from "@/features/snippets/services/get-random-snippets.client";
import {fetchLanguages} from "@/features/snippets/infrastructure/adapters/snippet-fetch.client";
import useTimer from "@/features/game/hooks/useTimer";
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
  const userPosition = useGameStore((state) => state.userPosition);
  const wrongKeystrokes = useGameStore((state) => state.wrongKeystrokes);
  const validKeystrokes = useGameStore((state) => state.validKeystrokes);
  const initialize = useGameStore((state) => state.initialize);
  const addSnippetsToQueue = useGameStore((state) => state.addSnippetsToQueue);
  const goToNextSnippet = useGameStore((state) => state.goToNextSnippet);
  const resetCurrentSnippet = useGameStore((state) => state.resetCurrentSnippet);
  const setParsedSnippet = useGameStore((state) => state.setParsedSnippet);
  const setUserPosition = useGameStore((state) => state.setUserPosition);
  const setStatus = useGameStore((state) => state.setStatus);
  const incrementWrongKeystroke = useGameStore((state) => state.incrementWrongKeystroke);
  const incrementValidKeystroke = useGameStore((state) => state.incrementValidKeystroke);

  const {startTimer, stopTimer, getTime, resetTimer} = useTimer();

  const [isNextButtonLocked, setIsNextButtonLocked] = useState(false);

  const backgroundFetchPromise = useRef<Promise<void> | null>(null);
  const availableLanguages = useRef<{[key: string]: ILanguage} | null>(null);

  const setSnippets = useCallback(
    async (selectedLanguage: ILanguage) => {
      const snippets = await getRandomCodeSnippets(selectedLanguage.id);
      initialize(selectedLanguage, snippets);
    },
    [initialize]
  );

  useEffect(() => {
    const initializeGame = async () => {
      const languages = await fetchLanguages();
      availableLanguages.current = languages;

      const defaultLanguage = languages[DEFAULT_LANGUAGE] ?? languages[Object.keys(languages)[0]];
      await setSnippets(defaultLanguage);
      resetTimer();
    };

    initializeGame();
  }, [resetTimer, setSnippets]);

  const backgroundGetSnippets = useCallback(async () => {
    const activeLanguage = language ?? availableLanguages.current?.[DEFAULT_LANGUAGE];
    if (!activeLanguage) return;

    const snippets = await getRandomCodeSnippets(activeLanguage.id);
    addSnippetsToQueue(snippets);
  }, [language, addSnippetsToQueue]);

  const goToNextSnippetWithPrefetch = useCallback(async () => {
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
  }, [status, snippetQueue.length, setStatus, language, backgroundGetSnippets, setSnippets, goToNextSnippet]);

  const resetSnippet = useCallback(() => {
    resetTimer();
    resetCurrentSnippet();
  }, [resetTimer, resetCurrentSnippet]);

  const handleStartGame = () => {
    startTimer();
  };

  const handleEndGame = () => {
    stopTimer();
  };

  const handleRestartGame = async () => {
    setStatus(GameStatus.LOADING);
    await goToNextSnippetWithPrefetch();
    resetTimer();
  };

  if (status === GameStatus.FINISHED && currentSnippet) {
    return (
      <EndgameView
        totalTime={getTime()}
        handleRestartGame={handleRestartGame}
        currentSnippet={currentSnippet}
        validKeystrokes={validKeystrokes}
        wrongKeystrokes={wrongKeystrokes}
      />
    );
  }

  if (status === GameStatus.LOADING || !availableLanguages.current || !currentSnippet || !language) {
    return <div>Loading...</div>;
  }

  return (
    <GameView
      onGameFinished={handleEndGame}
      onGameStarted={handleStartGame}
      changeSnippet={goToNextSnippetWithPrefetch}
      resetSnippet={resetSnippet}
      changeLanguage={setSnippets}
      isRefreshing={isNextButtonLocked}
      availableLanguages={availableLanguages.current}
      game={{
        status,
        language,
        currentSnippet,
        userPosition,
        wrongKeystrokes,
        validKeystrokes,
      }}
      actions={{
        setStatus,
        setParsedSnippet,
        setUserPosition,
        incrementWrongKeystroke,
        incrementValidKeystroke,
      }}
      key={currentSnippet.text}
    />
  );
}

export default Home;
