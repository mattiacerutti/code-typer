import {useState} from "react";
import TypingArea from "./TypingArea";
import {LanguageName} from "@lib/types/CodeLanguage";
import {useGameState} from "@/contexts/game-state/GameStateContext";
import { GameStatus } from "@/types/GameState";

interface IGamePanelProps {
  onGameFinished: () => void;
  onGameStarted: () => void;
  changeSnippet: () => void;
  resetSnippet: () => void;
  setSelectedLanguage: (language: LanguageName) => void;
  isRefreshing: boolean;
}

function GamePanel(props: IGamePanelProps) {
  const {onGameFinished, onGameStarted, changeSnippet: refreshSnippet, resetSnippet: restartGame, setSelectedLanguage, isRefreshing} = props;

  const [isCapsLockOn, setIsCapsLockOn] = useState<boolean>(false);

  const {gameState} = useGameState();

  return (
    <>
      <div className={`text-red-500 relative bottom-8 ${!isCapsLockOn && "opacity-0"} font-bold text-2xl`}>Caps Lock is on</div>
      <div className="flex flex-col gap-10 justify-center items-center">
        <TypingArea onGameFinished={onGameFinished} onGameStarted={onGameStarted} setIsCapsLockOn={setIsCapsLockOn} />
        <div className="flex flex-row gap-1.5 content-between">
          <button
            className="px-6 py-3 bg-slate-200 text-slate-900 font-medium rounded-md hover:bg-slate-300 disabled:opacity-20"
            onClick={restartGame}
            disabled={isRefreshing || gameState.status !== GameStatus.Started}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="currentColor"
                d="M12 2a1 1 0 1 0 0 2a8 8 0 1 1-6.924 3.99l1.217 1.217A1 1 0 0 0 8 8.5v-4a1 1 0 0 0-1-1H3a1 1 0 0 0-.707 1.707l1.33 1.33A9.955 9.955 0 0 0 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2"
              />
            </svg>
          </button>
          <button
            className="px-6 py-3 bg-slate-200 text-slate-900 font-medium rounded-md hover:bg-slate-300 disabled:opacity-20"
            onClick={() => refreshSnippet()}
            disabled={isRefreshing}
          >
            {!isRefreshing ? "Change Snippet" : "Wait.."}
          </button>
          <select
            disabled={isRefreshing}
            value={gameState.language}
            onChange={(e) => {
              setSelectedLanguage(e.target.value as LanguageName);
            }}
            className="px-6 py-3 bg-slate-200 text-slate-900 font-medium rounded-md hover:bg-slate-300 disabled:opacity-20"
          >
            {Object.values(LanguageName).map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}

export default GamePanel;
