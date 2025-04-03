"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {getRandomCodeSnippets as getRandomSnippets} from "@/services/snippets/snippet.service";
import useTimer from "@/hooks/useTimer";
import {GameStatus} from "@/types/game-state";
import {REFRESH_BUTTON_MIN_DELAY, DEFAULT_LANGUAGE} from "@/constants/constants";
import {useGameState} from "@/contexts/GameStateContext";
import GameView from "@/views/game-view";
import EndgameView from "@/views/endgame-view";
import {LanguageId} from "@/types/language";
import {ISnippet} from "@/types/snippet";
function Home() {
  const {dispatch, state} = useGameState();

  const {startTimer, stopTimer, getTime, resetTimer} = useTimer();

  const [isNextButtonLocked, setIsNextButtonLocked] = useState(false);
  const backgroundFetchPromise = useRef<Promise<void> | null>(null);

  const setSnippets = useCallback(
    async (language: LanguageId) => {
      const snippets = await getRandomSnippets(language);
      dispatch({
        type: "SET_SNIPPETS",
        payload: {snippets, language},
      });
    },
    [dispatch]
  );

  useEffect(() => {
    resetTimer();
    setSnippets(DEFAULT_LANGUAGE);
  }, [resetTimer, setSnippets]);

  const backgroundGetSnippets = async () => {
    if (!state.snippetQueue) return;

    const snippets = await getRandomSnippets(state.language);

    dispatch({type: "ADD_SNIPPETS_TO_QUEUE", payload: {snippets}});
  };

  const goToNextSnippet = async () => {
    if (state.status !== GameStatus.PLAYING && state.status !== GameStatus.READY && state.status !== GameStatus.FINISHED) return;

    const startTime = Date.now();
    setIsNextButtonLocked(true);

    if (state.snippetQueue.length === 0) {
      //If we're here the background fetch either failed or is still going
      dispatch({type: "SET_GAME_STATUS", payload: GameStatus.LOADING});

      if (backgroundFetchPromise.current) {
        // If the background fetch is still going, we wait.
        await backgroundFetchPromise.current;
        backgroundFetchPromise.current = null;
      } else {
        // Fallback: something went wrong with the background fetch
        setSnippets(state.language);
        return;
      }
    } else if (state.snippetQueue.length <= 3 && !backgroundFetchPromise.current) {
      // If we have only 3 snippet left, we re-fetch in the background
      backgroundFetchPromise.current = backgroundGetSnippets();
    }

    const elapsedTime = Date.now() - startTime;
    const remainingTime = REFRESH_BUTTON_MIN_DELAY - elapsedTime;

    dispatch({type: "GO_TO_NEXT_SNIPPET"});

    setTimeout(() => {
      setIsNextButtonLocked(false);
    }, remainingTime);
  };

  const resetSnippet = () => {
    resetTimer();
    dispatch({type: "RESET_GAME_STATE"});
  };

  const handleStartGame = () => {
    startTimer();
  };

  const handleEndGame = () => {
    stopTimer();
  };

  const handleRestartGame = async () => {
    dispatch({type: "SET_GAME_STATUS", payload: GameStatus.LOADING});
    await goToNextSnippet();
    resetTimer();
  };

  if (state.status === GameStatus.FINISHED)
    return (
      <>
        <EndgameView totalTime={getTime()} handleRestartGame={handleRestartGame} />
      </>
    );

  if (state.status === GameStatus.LOADING)
    return (
      <>
        <div>Loading...</div>
      </>
    );

  return (
    <GameView
      onGameFinished={handleEndGame}
      onGameStarted={handleStartGame}
      changeSnippet={goToNextSnippet}
      resetSnippet={resetSnippet}
      changeLanguage={setSnippets}
      isRefreshing={isNextButtonLocked}
      key={state.currentSnippet.text}
    />
  );
}

export default Home;
