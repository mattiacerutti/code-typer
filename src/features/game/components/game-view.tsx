"use client";

import TypingArea from "@/features/game/components/typing-area";
import useTyping from "@/features/game/hooks/useTyping";
import {GameStatus, IGameActions, IGameSnapshot} from "@/features/game/types/game-state";
import type {ILanguage} from "@/shared/types/language";

interface IGameViewProps {
  game: IGameSnapshot;
  actions: IGameActions;
  onGameFinished: () => void;
  onGameStarted: () => void;
  changeSnippet: () => void;
  resetSnippet: () => void;
  changeLanguage: (language: ILanguage) => void;
  availableLanguages: {[key: string]: ILanguage};
  isRefreshing: boolean;
}

function GameView(props: IGameViewProps) {
  const {
    game,
    actions,
    onGameFinished,
    onGameStarted,
    changeSnippet,
    resetSnippet,
    changeLanguage,
    availableLanguages,
    isRefreshing,
  } = props;

  const {status, language, currentSnippet, userPosition} = game;

  const {isCapsLockOn} = useTyping({
    status,
    snippet: currentSnippet.parsedSnippet,
    userPosition,
    onSnippetUpdate: actions.setParsedSnippet,
    onUserPositionChange: actions.setUserPosition,
    onStartTyping: onGameStarted,
    onWrongKeystroke: actions.incrementWrongKeystroke,
    onValidKeystroke: actions.incrementValidKeystroke,
  });

  const handleSnippetFinished = () => {
    actions.setStatus(GameStatus.FINISHED);
    onGameFinished();
  };

  return (
    <>
      <div className={`text-red-500 relative bottom-8 ${!isCapsLockOn && "opacity-0"} font-bold text-2xl`}>Caps Lock is on</div>
      <div className="flex flex-col gap-10 justify-center items-center">
        <TypingArea onGameFinished={handleSnippetFinished} game={game} />
        <div className="flex flex-row gap-1.5 content-between">
          <button
            className="px-6 py-3 bg-slate-200 text-slate-900 font-medium rounded-md hover:bg-slate-300 disabled:opacity-20"
            onClick={resetSnippet}
            disabled={isRefreshing || status !== GameStatus.PLAYING}
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
            value={language.id}
            onChange={(event) => {
              actions.setStatus(GameStatus.LOADING);
              changeLanguage(availableLanguages[event.target.value]);
            }}
            className="px-6 py-3 bg-slate-200 text-slate-900 font-medium rounded-md hover:bg-slate-300 disabled:opacity-20"
          >
            {Object.values(availableLanguages).map((availableLanguage) => (
              <option key={availableLanguage.id} value={availableLanguage.id}>
                {availableLanguage.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}

export default GameView;
