import {useCallback, useEffect, useRef, useState} from "react";
import {getRandomCodeSnippets} from "@/services/snippets/snippet.service";
import useTimer from "@/hooks/useTimer";
import {GameStatus} from "@/types/GameState";
import GamePanel from "./GamePanel";
import {REFRESH_BUTTON_MIN_DELAY} from "@/utils/constants";
import {useGameState} from "@/contexts/game-state/GameStateContext";
import EndPanel from "./EndPanel";

function GameView() {
  const {setSnippet, setLanguage, resetGameState, gameState} = useGameState();

  const codeSnippets = useRef<string[]>([]);

  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const {startTimer, stopTimer, getTime, resetTimer} = useTimer();

  useEffect(() => {
    // Handles language change. We re-fetch the snippets and select a random one.
    if (gameState.language) {
      setSnippet(null);
      resetGameState();
      resetTimer();
      getRandomCodeSnippets(gameState.language).then((ret) => {
        codeSnippets.current = ret;
        setSnippet(ret[0]);
      });
    }
  }, [gameState.language, setSnippet, resetGameState, resetTimer]);

  const goToNextSnippet = useCallback(async () => {
    // If we have only 3 snippet left, we re-fetch and append them to the end of the array
    if (codeSnippets.current.length <= 3) {
      const randomSnippets = await getRandomCodeSnippets(gameState.language);
      codeSnippets.current.push(...randomSnippets);
    }

    codeSnippets.current.shift();
    setSnippet(codeSnippets.current[0]);
  }, [codeSnippets, gameState.language, setSnippet]);

  const resetSnippet = useCallback(() => {
    resetGameState(false);
    resetTimer();
  }, [resetTimer, resetGameState]);

  const changeSnippet = useCallback(() => {
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
  }, [goToNextSnippet, resetSnippet]);

  const handleStartGame = useCallback(() => {
    startTimer();
  }, [startTimer]);

  const handleGameOver = useCallback(() => {
    stopTimer();
    setIsGameOver(true);
  }, [stopTimer]);

  const handleRestartGame = useCallback(() => {
    resetGameState();
    goToNextSnippet().then(() => {
      resetTimer();
      setIsGameOver(false);
    });
  }, [resetTimer, goToNextSnippet, resetGameState]);



  if (isGameOver && gameState.status === GameStatus.Finished)
    return (
      <>
        <EndPanel totalTime={getTime()} handleRestartGame={handleRestartGame} />
      </>
    );

  return (
    <>
      {gameState.snippet && (
        <GamePanel
          onGameFinished={handleGameOver}
          onGameStarted={handleStartGame}
          changeSnippet={changeSnippet}
          resetSnippet={resetSnippet}
          setSelectedLanguage={setLanguage}
          isRefreshing={isRefreshing}
          key={gameState.snippet.text}
        />
      )}
      {!gameState.snippet && <div>Loading...</div>}
    </>
  );
}

export default GameView;
