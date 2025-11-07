"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {buildClientSnippet, getRandomCodeSnippets} from "@/features/snippets/services/get-random-snippets.client";
import {fetchLanguages} from "@/features/snippets/infrastructure/adapters/snippet-fetch.client";
import useStopwatch from "@/features/game/hooks/useStopwatch";
import {GameStatus} from "@/features/game/types/game-status";
import {REFRESH_BUTTON_MIN_DELAY} from "@/features/game/config/game";
import {useGameStore} from "@/features/game/state/game-store";
import useSettingsStore from "@/features/settings/stores/settings-store";
import GameView from "@/features/game/components/game-view";
import EndgameView from "@/features/game/components/endgame-view";
import type {ILanguage} from "@/shared/types/language";
import type {ISnippet} from "@/shared/types/snippet";

function Home() {
  const status = useGameStore((state) => state.status);
  const language = useGameStore((state) => state.language);
  const currentSnippet = useGameStore((state) => state.currentSnippet);
  const initialize = useGameStore((state) => state.initialize);
  const addSnippetsToQueue = useGameStore((state) => state.addSnippetsToQueue);
  const goToNextSnippet = useGameStore((state) => state.goToNextSnippet);
  const resetCurrentSnippet = useGameStore((state) => state.resetCurrentSnippet);
  const setStatus = useGameStore((state) => state.setStatus);
  const registerPositionSample = useGameStore((state) => state.registerPositionSample);
  const getSnippetQueue = useGameStore((state) => state.getSnippetQueue);

  const autoClosingEnabled = useSettingsStore((state) => state.autoClosingEnabled);
  const setSelectedLanguage = useSettingsStore((state) => state.setSelectedLanguage);

  const [elapsedTime, setElapsedTime] = useState(0);

  const onTick = useCallback((elapsedTime: number) => {
    setElapsedTime(elapsedTime);
  }, []);

  const pushPositionSample = useCallback(
    (elapsedTime: number) => {
      const userPosition = useGameStore.getState().userPosition;
      if (userPosition === null) return;
      registerPositionSample(elapsedTime, userPosition);
    },
    [registerPositionSample]
  );

  const {startStopwatch, stopStopwatch, resetStopwatch, getTime} = useStopwatch({onTick, onInterval: pushPositionSample});

  const [isNextButtonLocked, setIsNextButtonLocked] = useState(false);

  const backgroundFetchPromise = useRef<Promise<void> | null>(null);
  const availableLanguages = useRef<{[key: string]: ILanguage} | null>(null);

  const setSnippets = useCallback(
    async (selectedLanguage: ILanguage) => {
      setSelectedLanguage(selectedLanguage);
      resetStopwatch();
      const autoClosingEnabled = useSettingsStore.getState().autoClosingEnabled;
      const snippets = await getRandomCodeSnippets(selectedLanguage.id, autoClosingEnabled);

      initialize(selectedLanguage, snippets);
    },
    [initialize, resetStopwatch, setSelectedLanguage]
  );

  const backgroundGetSnippets = useCallback(async () => {
    const autoClosingEnabled = useSettingsStore.getState().autoClosingEnabled;
    const snippets = await getRandomCodeSnippets(language!.id, autoClosingEnabled);

    addSnippetsToQueue(snippets);
  }, [language, addSnippetsToQueue]);

  const goToNextSnippetWithPrefetch = async () => {
    if (status !== GameStatus.PLAYING && status !== GameStatus.READY && status !== GameStatus.FINISHED) return;

    const snippetQueue = getSnippetQueue();

    const startTime = Date.now();
    setIsNextButtonLocked(true);

    if (snippetQueue.length === 0) {
      setStatus(GameStatus.LOADING);

      if (backgroundFetchPromise.current) {
        await backgroundFetchPromise.current;
        backgroundFetchPromise.current = null;
      } else {
        await setSnippets(language!);
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
    pushPositionSample(getTime());
    setStatus(GameStatus.FINISHED);
  }, [stopStopwatch, getTime, pushPositionSample, setStatus]);

  const handleChangeSnippet = async () => {
    setStatus(GameStatus.LOADING);
    await goToNextSnippetWithPrefetch();
    resetStopwatch();
  };

  useEffect(() => {
    const initializeGame = async () => {
      const languages = await fetchLanguages();
      availableLanguages.current = languages;

      const selectedLanguage = useSettingsStore.getState().selectedLanguage;

      const langId = selectedLanguage?.id ?? Object.keys(languages)[0];

      await setSnippets(languages[langId]);
    };
    initializeGame();
  }, [setSnippets]);

  const reparseExistingSnippets = useCallback(async () => {
    const gameState = useGameStore.getState();
    const activeLanguage = gameState.language;
    const activeSnippet = gameState.currentSnippet;
    if (!activeLanguage || !activeSnippet) return;

    const snippetsToReparse = [activeSnippet, ...gameState.getSnippetQueue()];

    setStatus(GameStatus.LOADING);
    resetStopwatch();

    const reparsedSnippets = snippetsToReparse
      .map((snippet) => buildClientSnippet(snippet.rawSnippet, autoClosingEnabled))
      .filter((snippet): snippet is ISnippet => snippet !== null);

    if (reparsedSnippets.length === 0) {
      await setSnippets(activeLanguage);
      return;
    }

    initialize(activeLanguage, reparsedSnippets);
  }, [autoClosingEnabled, initialize, resetStopwatch, setSnippets, setStatus]);

  useEffect(() => {
    reparseExistingSnippets();
  }, [autoClosingEnabled, reparseExistingSnippets]);

  if (status === GameStatus.FINISHED && currentSnippet) {
    return <EndgameView handleChangeSnippet={handleChangeSnippet} handleRetrySnippet={resetSnippet} />;
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
