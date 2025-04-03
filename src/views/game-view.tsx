"use client";

import {useGameState} from "@/contexts/GameStateContext";
import {GameStatus} from "@/types/game-state";
import TypingArea from "@/components/typing-area";
import useTyping from "@/hooks/useTyping";
import {ILanguage} from "@/types/language";

interface IGameViewProps {
  onGameFinished: () => void;
  onGameStarted: () => void;
  changeSnippet: () => void;
  resetSnippet: () => void;
  changeLanguage: (language: ILanguage) => void;
  availableLanguages: {[key: string]: ILanguage};
  isRefreshing: boolean;
}

function GameView(props: IGameViewProps) {
  const {onGameFinished, onGameStarted, changeSnippet, resetSnippet, isRefreshing, changeLanguage, availableLanguages} = props;

  const {state, dispatch} = useGameState();

  if (state.status === GameStatus.LOADING || state.status === GameStatus.FINISHED) {
    throw new Error("GameView: Received invalid game state");
  }

  const onWrongKeystroke = () => {
    if (state.status !== GameStatus.PLAYING) return;
    state.wrongKeystrokes += 1;
  };

  const onValidKeystroke = () => {
    if (state.status !== GameStatus.PLAYING) return;
    state.validKeystrokes += 1;
  };

  const {isCapsLockOn} = useTyping({onWrongKeystroke, onValidKeystroke, onStartTyping: onGameStarted});

  return (
    <>
      <div className={`text-red-500 relative bottom-8 ${!isCapsLockOn && "opacity-0"} font-bold text-2xl`}>Caps Lock is on</div>
      <div className="flex flex-col gap-10 justify-center items-center">
        <TypingArea onGameFinished={onGameFinished} />
        <div className="flex flex-row gap-1.5 content-between">
          <button
            className="px-6 py-3 bg-slate-200 text-slate-900 font-medium rounded-md hover:bg-slate-300 disabled:opacity-20"
            onClick={resetSnippet}
            disabled={isRefreshing || state.status !== GameStatus.PLAYING}
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
            onClick={changeSnippet}
            disabled={isRefreshing}
          >
            {!isRefreshing ? "Change Snippet" : "Wait.."}
          </button>
          <select
            disabled={isRefreshing}
            value={state.language.id}
            onChange={(e) => {
              dispatch({type: "SET_GAME_STATUS", payload: GameStatus.LOADING});
              changeLanguage(availableLanguages[e.target.value]);
            }}
            className="px-6 py-3 bg-slate-200 text-slate-900 font-medium rounded-md hover:bg-slate-300 disabled:opacity-20"
          >
            {Object.values(availableLanguages).map((language) => (
              <option key={language.id} value={language.id}>
                {language.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}

export default GameView;
