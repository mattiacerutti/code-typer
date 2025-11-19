"use client";

import {useEffect, useRef, useState, useEffectEvent} from "react";
import useStopwatch from "@/features/game/hooks/useStopwatch";
import {useGameStore} from "@/features/game/state/game-store";
import useSettingsStore from "@/features/settings/stores/settings-store";
import GameView from "@/features/game/components/game-view";
import EndgameView from "@/features/game/components/endgame-view";
import {track} from "@/features/game/logic/track";
import {useGameSnippets} from "@/features/game/hooks/useGameSnippets";
import {GameStatus} from "@/features/game/types/game-status";
import {buildClientSnippet} from "@/features/snippets/services/get-random-snippets.client";
import type {ISnippet as IClientSnippet} from "@/features/shared/types/snippet";
import type {ILanguage} from "@/features/shared/types/language";
import {AutoClosingMode} from "@/features/settings/types/autoclosing-mode";

function Home() {
  const status = useGameStore((state) => state.status);
  const initialize = useGameStore((state) => state.initialize);
  const resetCurrentSnippet = useGameStore((state) => state.resetCurrentSnippet);
  const setStatus = useGameStore((state) => state.setStatus);
  const registerPositionSample = useGameStore((state) => state.registerPositionSample);

  const autoClosingMode = useSettingsStore((state) => state.autoClosingMode);

  const [elapsedTime, setElapsedTime] = useState(0);

  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  const onTick = (elapsed: number) => {
    setElapsedTime(elapsed);
  };

  const pushPositionSample = (elapsed: number) => {
    const userPosition = useGameStore.getState().userPosition;
    if (userPosition === null) return;
    registerPositionSample(elapsed, userPosition);
  };

  const {startStopwatch, stopStopwatch, resetStopwatch, getTime} = useStopwatch({onTick, onInterval: pushPositionSample});
  const {availableLanguages, languagesError, isNextButtonLocked, activateLanguage, changeSnippet} = useGameSnippets();

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

  const handleSnippetChange = async () => {
    setStatus(GameStatus.LOADING);
    resetStopwatch();
    await changeSnippet();
    hiddenInputRef.current?.focus();
    track("SNIPPET_CHANGE");
  };

  const handleChangeLanguage = async (selectedLanguage: ILanguage) => {
    resetStopwatch();
    activateLanguage(selectedLanguage);
    track("LANGUAGE_CHANGE", {language: selectedLanguage.name});
  };

  const activateLanguageEvent = useEffectEvent((language: ILanguage) => {
    resetStopwatch();
    activateLanguage(language);
  });

  // Initialize game on available languages load
  useEffect(() => {
    if (!availableLanguages) return;

    const selectedLanguage = useSettingsStore.getState().selectedLanguage;
    const langId = selectedLanguage?.id ?? Object.keys(availableLanguages)[0];
    if (!langId) return;

    const languageToUse = availableLanguages[langId];
    if (!languageToUse) return;

    activateLanguageEvent(languageToUse);
  }, [availableLanguages]);

  // Every time autoclosing mode changes, reparse all snippets
  useEffect(() => {
    const gameState = useGameStore.getState();
    const activeLanguage = gameState.language;
    const activeSnippet = gameState.currentSnippet;
    if (!activeLanguage || !activeSnippet) return;

    setStatus(GameStatus.LOADING);
    resetStopwatch();

    const snippetsToReparse = [activeSnippet, ...gameState.getSnippetQueue()];
    const reparsedSnippets = snippetsToReparse
      .map((snippet) => buildClientSnippet(snippet.rawSnippet, autoClosingMode !== AutoClosingMode.DISABLED))
      .filter((snippet): snippet is IClientSnippet => snippet !== null);

    initialize(activeLanguage, reparsedSnippets);
  }, [autoClosingMode, initialize, resetStopwatch, setStatus]);

  if (status === GameStatus.FINISHED) {
    return <EndgameView handleChangeSnippet={handleSnippetChange} handleRetrySnippet={handleResetSnippet} />;
  }

  if (languagesError) {
    return <div>Failed to load languages.</div>;
  }

  if (status === GameStatus.LOADING) {
    return <div>Loading...</div>;
  }

  return (
    <GameView
      onGameFinished={handleEndGame}
      onGameStarted={handleStartGame}
      changeSnippet={handleSnippetChange}
      resetSnippet={handleResetSnippet}
      changeLanguage={handleChangeLanguage}
      isRefreshing={isNextButtonLocked}
      availableLanguages={availableLanguages!}
      elapsedTime={elapsedTime}
      hiddenInputRef={hiddenInputRef}
    />
  );
}

export default Home;
