"use client";

import {useEffect, useRef, useState} from "react";
import {getRandomCodeSnippets} from "@/services/snippets/snippet.service";
import useTimer from "@/hooks/useTimer";
import {GameStatus} from "@/types/game-state";
import {REFRESH_BUTTON_MIN_DELAY} from "@/constants/constants";
import {useGameState} from "@/contexts/GameStateContext";
import GamePage from "@/pages/game-page";
import EndPage from "@/pages/end-page";

function Home() {
  const {dispatch, state} = useGameState();

  const codeSnippets = useRef<string[]>([]);

  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const {startTimer, stopTimer, getTime, resetTimer} = useTimer();

  useEffect(() => {
    // Handles language change. We re-fetch the snippets and select a random one.
    if (state.language) {
      dispatch({type: "RESET_GAME_STATE", keepSnippet: true});
      resetTimer();
      getRandomCodeSnippets(state.language).then((ret) => {
        codeSnippets.current = ret;
        dispatch({type: "SET_SNIPPET", payload: ret[0]});
      });
    }
  }, [state.language, dispatch, resetTimer]);

  const goToNextSnippet = async () => {
    // If we have only 3 snippet left, we re-fetch and append them to the end of the array
    if (codeSnippets.current.length <= 3) {
      const randomSnippets = await getRandomCodeSnippets(state.language);
      codeSnippets.current.push(...randomSnippets);
    }

    codeSnippets.current.shift();
    dispatch({type: "SET_SNIPPET", payload: codeSnippets.current[0]});
  }

  const resetSnippet = () => {
    dispatch({type: "RESET_GAME_STATE", keepSnippet: false});
    resetTimer();
  }

  const changeSnippet = () => {
    setIsRefreshing(true);

    resetSnippet();

    const startTime = Date.now();
    goToNextSnippet().then(() => {
      const elapsedTime = Date.now() - startTime;

      const remainingTime = REFRESH_BUTTON_MIN_DELAY - elapsedTime;

      // If going to the next snippet took less than the minimum delay, we wait for the remaining time (we do this to prevent refresh spamming)
      if (remainingTime > 0) {
        setTimeout(() => {
          setIsRefreshing(false);
        }, remainingTime);
      } else {
        setIsRefreshing(false);
      }
    });
  }

  const handleStartGame = () => {
    startTimer();
  }

  const handleGameOver = () => {
    stopTimer();
    setIsGameOver(true);
  }

  const handleRestartGame = () => {
    dispatch({type: "RESET_GAME_STATE", keepSnippet: true});
    goToNextSnippet().then(() => {
      resetTimer();
      setIsGameOver(false);
    });
  }



  if (isGameOver && state.status === GameStatus.Finished)
    return (
      <>
        <EndPage totalTime={getTime()} handleRestartGame={handleRestartGame} />
      </>
    );

  return (
    <>
      {state.snippet && (
        <GamePage
          onGameFinished={handleGameOver}
          onGameStarted={handleStartGame}
          changeSnippet={changeSnippet}
          resetSnippet={resetSnippet}
          isRefreshing={isRefreshing}
          key={state.snippet.text}
        />
      )}
      {!state.snippet && <div>Loading...</div>}
    </>
  );
}

export default Home;
