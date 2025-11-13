"use client";

import {useEffect, useRef, useState} from "react";
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
import {AutoClosingMode} from "@/features/settings/types/autoclosing-mode";
import {track} from "@/features/game/logic/track";

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

  const autoClosingMode = useSettingsStore((state) => state.autoClosingMode);
  const setSelectedLanguage = useSettingsStore((state) => state.setSelectedLanguage);

  const [elapsedTime, setElapsedTime] = useState(0);

  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  const onTick = (elapsedTime: number) => {
    setElapsedTime(elapsedTime);
  };

  const pushPositionSample = (elapsedTime: number) => {
    const userPosition = useGameStore.getState().userPosition;
    if (userPosition === null) return;
    registerPositionSample(elapsedTime, userPosition);
  };

  const {startStopwatch, stopStopwatch, resetStopwatch, getTime} = useStopwatch({onTick, onInterval: pushPositionSample});

  const [isNextButtonLocked, setIsNextButtonLocked] = useState(false);

  const backgroundFetchPromise = useRef<Promise<void> | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<{[key: string]: ILanguage} | null>(null);

  const setSnippets = async (selectedLanguage: ILanguage) => {
    setSelectedLanguage(selectedLanguage);
    resetStopwatch();
    const autoClosingMode = useSettingsStore.getState().autoClosingMode;
    const snippets = await getRandomCodeSnippets(selectedLanguage.id, autoClosingMode !== AutoClosingMode.DISABLED);
    initialize(selectedLanguage, snippets);
  };

  const backgroundGetSnippets = async () => {
    if (!language) return;
    const autoClosingMode = useSettingsStore.getState().autoClosingMode;
    const snippets = await getRandomCodeSnippets(language!.id, autoClosingMode !== AutoClosingMode.DISABLED);

    addSnippetsToQueue(snippets);
  };

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

  const handleResetSnippet = () => {
    resetStopwatch();
    resetCurrentSnippet();
    track("SNIPPET_RETRY");
  };

  const handleStartGame = () => {
    startStopwatch();
    track("GAME_START");
  };

  const handleEndGame = () => {
    stopStopwatch();
    pushPositionSample(getTime());
    setStatus(GameStatus.FINISHED);
    track("GAME_END");
  };

  const handleChangeSnippet = async () => {
    setStatus(GameStatus.LOADING);
    await goToNextSnippetWithPrefetch();
    resetStopwatch();
    hiddenInputRef.current?.focus();
    track("SNIPPET_CHANGE");
  };

  const handleChangeLanguage = async (selectedLanguage: ILanguage) => {
    await setSnippets(selectedLanguage);
    track("LANGUAGE_CHANGE", {language: selectedLanguage.name});
  };

  useEffect(() => {
    const initializeGame = async () => {
      const languages = await fetchLanguages();
      setAvailableLanguages(languages);

      const selectedLanguage = useSettingsStore.getState().selectedLanguage;

      const langId = selectedLanguage?.id ?? Object.keys(languages)[0];

      await setSnippets(languages[langId]);
    };
    initializeGame();
  }, [setSnippets]);

  const reparseExistingSnippets = async () => {
    const gameState = useGameStore.getState();
    const activeLanguage = gameState.language;
    const activeSnippet = gameState.currentSnippet;
    if (!activeLanguage || !activeSnippet) return;

    const snippetsToReparse = [activeSnippet, ...gameState.getSnippetQueue()];

    setStatus(GameStatus.LOADING);
    resetStopwatch();

    const reparsedSnippets = snippetsToReparse
      .map((snippet) => buildClientSnippet(snippet.rawSnippet, autoClosingMode !== AutoClosingMode.DISABLED))
      .filter((snippet): snippet is ISnippet => snippet !== null);

    if (reparsedSnippets.length === 0) {
      await setSnippets(activeLanguage);
      return;
    }

    initialize(activeLanguage, reparsedSnippets);
  };

  useEffect(() => {
    reparseExistingSnippets();
  }, [autoClosingMode, reparseExistingSnippets]);

  if (status === GameStatus.FINISHED && currentSnippet) {
    return <EndgameView handleChangeSnippet={handleChangeSnippet} handleRetrySnippet={handleResetSnippet} />;
  }

  if (status === GameStatus.LOADING || !availableLanguages || !currentSnippet || !language) {
    return <div>Loading...</div>;
  }

  return (
    <GameView
      onGameFinished={handleEndGame}
      onGameStarted={handleStartGame}
      changeSnippet={handleChangeSnippet}
      resetSnippet={handleResetSnippet}
      changeLanguage={handleChangeLanguage}
      isRefreshing={isNextButtonLocked}
      availableLanguages={availableLanguages}
      elapsedTime={elapsedTime}
      hiddenInputRef={hiddenInputRef}
    />
  );
}

export default Home;
