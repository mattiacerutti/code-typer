import {useCallback, useEffect, useRef, useState} from "react";
import {getRandomCodeSnippets} from "@/services/snippets/snippet.service";
import useTimer from "@/hooks/useTimer";
import {GameStatus} from "@/types/GameState";
import GamePanel from "./GamePanel";
import {REFRESH_BUTTON_MIN_DELAY} from "@/utils/constants";
import {useGameState} from "@/contexts/game-state/GameStateContext";
import { calculateAccuracy, calculateWPM, humanizeTime } from "@/utils/game-utils";

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
      getRandomCodeSnippets(gameState.language).then((ret) => {
        codeSnippets.current = ret;
        setSnippet(ret[0]);
      });
    }
  }, [gameState.language, setSnippet]);

  const goToNextSnippet = useCallback(async () => {
    // If we have only 3 snippet left, we re-fetch and append them to the end of the array
    if (codeSnippets.current.length <= 3) {
      const randomSnippets = await getRandomCodeSnippets(gameState.language);
      codeSnippets.current.push(...randomSnippets);
    }

    codeSnippets.current.shift();
    setSnippet(codeSnippets.current[0]);
  }, [codeSnippets, gameState.language, setSnippet]);

  const refreshSnippet = useCallback(() => {
    setIsRefreshing(true);

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
  }, [goToNextSnippet]);

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

  if (isGameOver && gameState.status === GameStatus.Finished && gameState.snippet)
    return (
      <div>
        <h1 className="text-3xl font-bold">Game Over</h1>
        <h2 className="text-xl font-bold">Your time: {humanizeTime(getTime())}</h2>
        <h2 className="text-xl font-bold">WPM: {calculateWPM(getTime(), gameState.snippet.length)}</h2>
        <h2 className="text-xl font-bold">Accuracy: {calculateAccuracy(gameState.validKeystrokes, gameState.wrongKeystrokes)}%</h2>
        <button className="px-6 py-3 bg-slate-200 text-slate-900 font-medium rounded-md hover:bg-slate-300 disabled:opacity-20" onClick={handleRestartGame}>
          Restart
        </button>
      </div>
    );

  return (
    <>
      {gameState.snippet && (
        <GamePanel
          onGameFinished={handleGameOver}
          onGameStarted={handleStartGame}
          refreshSnippet={refreshSnippet}
          setSelectedLanguage={setLanguage}
          isRefreshing={isRefreshing}
          key={gameState.snippet}
        />
      )}
      {!gameState.snippet && <div>Loading...</div>}
    </>
  );
}

export default GameView;
