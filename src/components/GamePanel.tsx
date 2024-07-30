import { useState} from "react";
import TypingArea from "./TypingArea";
import {LanguageName} from "@/types/CodeLanguage";
import { useGameState } from "@/contexts/game-state/GameStateContext";

interface IGamePanelProps {
  onGameFinished: () => void;
  onGameStarted: () => void;
  refreshSnippet: () => void;
  setSelectedLanguage: (language: LanguageName) => void;
  isRefreshing: boolean;
}

function GamePanel(props: IGamePanelProps) {

  const {onGameFinished, onGameStarted, refreshSnippet, setSelectedLanguage, isRefreshing} = props;

  const [isCapsLockOn, setIsCapsLockOn] = useState<boolean>(false);


  return (
    <>
      <div className={`text-red-500 relative bottom-8 ${!isCapsLockOn && "opacity-0"} font-bold text-2xl`}>Caps Lock is on</div>
      <div className="flex flex-col gap-10 justify-center items-center">
        <TypingArea
          onGameFinished={onGameFinished}
          onGameStarted={onGameStarted}
          setIsCapsLockOn={setIsCapsLockOn}
        />
        <div className="flex flex-row gap-1.5 content-between">
          <button
            className="px-6 py-3 bg-slate-200 text-slate-900 font-medium rounded-md hover:bg-slate-300 disabled:opacity-20"
            onClick={() => refreshSnippet()}
            disabled={isRefreshing}
          >
            {!isRefreshing ? "Refresh Snippet" : "Wait.."}
          </button>
          <select
            disabled={isRefreshing}
            value={useGameState().gameState.language}
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
