import TypingArea from "@/features/game/components/typing-area";
import useTyping from "@/features/game/hooks/useTyping";
import {GameStatus} from "@/features/game/types/game-status";
import type {ILanguage} from "@/features/shared/types/language";
import {humanizeTime} from "@/features/game/utils/typing-metrics";
import {useGameStore} from "../state/game-store";
import {useState} from "react";
import SettingsModal from "@/features/settings/components/modal";
import {IoSettingsSharp} from "react-icons/io5";
import {ImShare2} from "react-icons/im";
import useSettingsStore from "@/features/settings/stores/settings-store";

interface IGameViewProps {
  onGameFinished: () => void;
  onGameStarted: () => void;
  changeSnippet: () => void;
  resetSnippet: () => void;
  changeLanguage: (language: ILanguage) => void;
  availableLanguages: {[key: string]: ILanguage};
  isRefreshing: boolean;
  elapsedTime: number;
  hiddenInputRef: React.RefObject<HTMLInputElement | null>;
}

function GameView(props: IGameViewProps) {
  const {onGameFinished, onGameStarted, changeSnippet, resetSnippet, changeLanguage, availableLanguages, isRefreshing, elapsedTime, hiddenInputRef} = props;

  const status = useGameStore((state) => state.status);
  const language = useGameStore((state) => state.language)!;
  const currentSnippet = useGameStore((state) => state.currentSnippet)!;
  const userPosition = useGameStore((state) => state.userPosition)!;
  const updateCurrentSnippet = useGameStore((state) => state.updateCurrentSnippet);
  const updateUserPosition = useGameStore((state) => state.updateUserPosition);
  const setStatus = useGameStore((state) => state.setStatus);
  const incrementWrongKeystroke = useGameStore((state) => state.incrementWrongKeystroke);
  const incrementValidKeystroke = useGameStore((state) => state.incrementValidKeystroke);

  const {isCapsLockOn} = useTyping({
    status,
    snippet: currentSnippet.parsedSnippet,
    userPosition,
    autoClosingMode: useSettingsStore((state) => state.autoClosingMode),
    onSnippetUpdate: updateCurrentSnippet,
    onUserPositionChange: updateUserPosition,
    onStartTyping: onGameStarted,
    onWrongKeystroke: incrementWrongKeystroke,
    onValidKeystroke: incrementValidKeystroke,
    hiddenInputRef,
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleSnippetFinished = () => {
    onGameFinished();
  };

  console.log({currentSnippet});

  return (
    <>
      <SettingsModal isOpen={isSettingsModalOpen} closeModal={() => setIsSettingsModalOpen(false)} />
      <div className="flex flex-col items-center justify-center">
        <div className={`relative bottom-8 text-(--color-danger) ${!isCapsLockOn && "opacity-0"} text-2xl font-bold`}>Caps Lock is on</div>
        <div className="flex flex-col items-center justify-end gap-10">
          <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center before:content-['']">
            <div className="flex h-full flex-1 justify-center">
              <div className="h-fit w-fit min-w-20 rounded-md bg-(--color-surface) px-4 py-2 text-center align-middle font-medium text-(--color-foreground)">
                {humanizeTime(elapsedTime)}
              </div>
            </div>
            <div className="flex gap-2 justify-self-end">
              <button
                className="aspect-square h-auto w-fit rounded-md bg-(--color-accent) px-4 py-2 text-center font-medium text-(--color-accent-contrast) shadow-sm enabled:hover:bg-(--color-accent-hover) disabled:cursor-not-allowed disabled:opacity-20"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("snippet", currentSnippet.rawSnippet.id);
                  navigator.clipboard.writeText(url.toString());
                  console.log("Copied to clipboard:", url.toString());
                }}
                disabled={status !== GameStatus.READY}
              >
                <ImShare2 />
              </button>
              <button
                className="aspect-square h-auto w-fit rounded-md bg-(--color-accent) px-4 py-2 text-center font-medium text-(--color-accent-contrast) shadow-sm enabled:hover:bg-(--color-accent-hover) disabled:cursor-not-allowed disabled:opacity-20"
                onClick={() => setIsSettingsModalOpen(true)}
                disabled={status !== GameStatus.READY}
              >
                <IoSettingsSharp />
              </button>
            </div>
          </div>
          <div className="relative h-fit w-fit">
            <TypingArea onGameFinished={handleSnippetFinished} />
            <input
              className="peer absolute top-0 h-full w-full cursor-default rounded-2xl text-transparent caret-transparent backdrop-blur-xs transition-opacity duration-200 outline-none selection:bg-transparent focus:opacity-0 starting:opacity-0"
              ref={hiddenInputRef}
              type="text"
              value="PLACEHOLDER"
              onChange={() => {}}
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
              list="autocompleteOff"
              spellCheck="false"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-lg transition-opacity duration-200 peer-focus:opacity-0 starting:opacity-0">
              Click here or press any key to focus
            </div>
          </div>

          <div className="flex flex-row content-between gap-1.5">
            <button
              className="rounded-md bg-(--color-accent) px-6 py-3 font-medium text-(--color-accent-contrast) shadow-sm hover:bg-(--color-accent-hover) disabled:opacity-20"
              onMouseDown={(e) => e.preventDefault()}
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
              className="rounded-md bg-(--color-accent) px-6 py-3 text-(--color-accent-contrast) shadow-sm hover:bg-(--color-accent-hover) disabled:opacity-20"
              onMouseDown={(e) => e.preventDefault()}
              onClick={changeSnippet}
              disabled={isRefreshing}
            >
              {!isRefreshing ? "Change Snippet" : "Wait.."}
            </button>
            <select
              disabled={isRefreshing}
              value={language.id}
              onChange={(event) => {
                setStatus(GameStatus.LOADING);
                changeLanguage(availableLanguages[event.target.value]);
              }}
              className="rounded-md bg-(--color-accent) px-6 py-3 font-medium text-(--color-accent-contrast) shadow-sm hover:bg-(--color-accent-hover) disabled:opacity-20"
            >
              {Object.values(availableLanguages).map((availableLanguage) => (
                <option key={availableLanguage.id} value={availableLanguage.id}>
                  {availableLanguage.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

export default GameView;
