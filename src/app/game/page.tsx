"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {getRandomCodeSnippets as getRandomSnippets} from "@/services/snippets/snippet.service";
import useTimer from "@/hooks/useTimer";
import {GameStatus} from "@/types/game-state";
import {REFRESH_BUTTON_MIN_DELAY, DEFAULT_LANGUAGE} from "@/constants/constants";
import {useGameState} from "@/contexts/GameStateContext";
import GameView from "@/views/game-view";
import EndgameView from "@/views/endgame-view";
import {ILanguage} from "@/types/language";
import {fetchLanguages} from "@/services/snippets/snippet-fetch.service";

function Home() {
  const {dispatch, state} = useGameState();

  const {startTimer, stopTimer, getTime, resetTimer} = useTimer();

  const [isNextButtonLocked, setIsNextButtonLocked] = useState(false);

  const backgroundFetchPromise = useRef<Promise<void> | null>(null);
  const availableLanguages = useRef<{[key: string]: ILanguage} | null>(null);

  const setSnippets = useCallback(
    async (language: ILanguage) => {
      const snippets = await getRandomSnippets(language.id);
      dispatch({
        type: "SET_SNIPPETS",
        payload: {snippets, language},
      });
    },
    [dispatch]
  );

  useEffect(() => {
    const initialize = async () => {
      availableLanguages.current = await fetchLanguages();
      resetTimer();
      setSnippets(availableLanguages.current[DEFAULT_LANGUAGE] ?? availableLanguages.current[Object.keys(availableLanguages.current)[0]]);
    };

    initialize();
  }, [resetTimer, setSnippets]);

  const backgroundGetSnippets = async () => {
    if (!state.snippetQueue) return;

    
    const snippets = await getRandomSnippets(state.language?.id ?? DEFAULT_LANGUAGE);

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
      availableLanguages={availableLanguages.current!}
      key={state.currentSnippet.text}
    />
  );
}

export default Home;
