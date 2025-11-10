import TypingArea from "@/features/game/components/typing-area";
import useTyping from "@/features/game/hooks/useTyping";
import {GameStatus} from "@/features/game/types/game-status";
import type {ILanguage} from "@/shared/types/language";
import {humanizeTime} from "@/features/game/utils/typing-metrics";
import {useGameStore} from "../state/game-store";
import {useMemo, useState} from "react";
import SettingsModal from "@/features/settings/components/modal";
import {IoClose, IoSettingsSharp} from "react-icons/io5";
import useSettingsStore from "@/features/settings/stores/settings-store";
import LanguageMenu from "@/features/game/components/language-menu";

interface IGameViewProps {
  onGameFinished: () => void;
  onGameStarted: () => void;
  changeSnippet: () => void;
  resetSnippet: () => void;
  changeLanguage: (language: ILanguage) => void;
  availableLanguages: {[key: string]: ILanguage};
  isRefreshing: boolean;
  elapsedTime: number;
}

interface IModalProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function OverlayModal({title, subtitle, isOpen, onClose, children}: IModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div className="relative w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-6 text-zinc-900 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <button className="absolute top-4 right-4 text-zinc-500 hover:text-black" aria-label="Close" onClick={onClose}>
          <IoClose size={20} />
        </button>
        <h2 className="text-2xl font-semibold text-black">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
        <div className="mt-4 space-y-3 text-sm text-zinc-700">{children}</div>
      </div>
    </div>
  );
}

function GameView(props: IGameViewProps) {
  const {onGameFinished, onGameStarted, changeSnippet, resetSnippet, changeLanguage, availableLanguages, isRefreshing, elapsedTime} = props;

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
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const languageOptions = useMemo(() => Object.values(availableLanguages).sort((a, b) => a.name.localeCompare(b.name)), [availableLanguages]);

  const handleSnippetFinished = () => {
    onGameFinished();
  };

  return (
    <>
      <SettingsModal isOpen={isSettingsModalOpen} closeModal={() => setIsSettingsModalOpen(false)} />
      <OverlayModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} title="Quick tutorial" subtitle="Keep accuracy high before chasing speed.">
        <ol className="list-decimal space-y-2 pl-4">
          <li>Pick a language, then wait for the snippet queue to load.</li>
          <li>Begin typing to start the timer. The caret follows your position.</li>
          <li>Reset if you want a clean take without changing the snippet.</li>
          <li>Use Change Snippet whenever you want a new challenge.</li>
        </ol>
      </OverlayModal>
      <OverlayModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} title="Game docs" subtitle="Reference for gameplay and settings">
        <div>
          <h3 className="text-sm font-semibold text-black">How to play</h3>
          <p>Typing starts the session timer. Every character must match the snippet exactly, including whitespace and symbols.</p>
          <p>Accuracy updates live. Incorrect keystrokes highlight in red until corrected.</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-black">Buttons</h3>
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <strong>Reset</strong>: clears all progress for the current snippet.
            </li>
            <li>
              <strong>Change snippet</strong>: loads the next snippet in sequence.
            </li>
            <li>
              <strong>Language selector</strong>: reloads snippets for the selected language or stack.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-black">Settings</h3>
          <p>Auto-closing mode controls how brackets and quotes behave during typing. Choose before starting a session.</p>
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <strong>Full</strong>: All brackets, parentheses, and quotation marks are auto-closed and skipped automatically when you reach them.
            </li>
            <li>
              <strong>Partial</strong>: Auto-closes all pairs, but you must type the closing character or press the right arrow to move past it.
            </li>
            <li>
              <strong>Disabled</strong>: No auto-closing; every bracket and quote must be typed manually.
            </li>
          </ul>
        </div>
      </OverlayModal>

      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <header className="flex flex-col gap-4 border-b border-black/5 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs tracking-[0.4em] text-zinc-500 uppercase">Code typer</p>
            <h1 className="text-2xl font-semibold text-black">Practice board</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-black" onClick={() => setIsTutorialOpen(true)}>
              Tutorial
            </button>
            <button className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-black" onClick={() => setIsDocsOpen(true)}>
              Docs
            </button>
            <button
              className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
              onClick={() => setIsSettingsModalOpen(true)}
              disabled={status !== GameStatus.READY}
            >
              <IoSettingsSharp />
              Settings
            </button>
          </div>
        </header>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600">
            <div className="flex items-center gap-2 text-lg font-semibold text-black">{humanizeTime(elapsedTime)}</div>
            <div className={`text-sm font-medium text-red-600 ${!isCapsLockOn ? "invisible" : ""}`}>Caps Lock is on</div>
          </div>
          <TypingArea onGameFinished={handleSnippetFinished} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="flex-1 rounded-xl border border-black/10 bg-black px-4 py-3 text-sm font-semibold text-white disabled:bg-zinc-500"
              onClick={resetSnippet}
              disabled={isRefreshing || status !== GameStatus.PLAYING}
            >
              Reset
            </button>
            <button
              className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-40"
              onClick={changeSnippet}
              disabled={isRefreshing}
            >
              {!isRefreshing ? "Change snippet" : "Wait"}
            </button>
            <div className="flex-1">
              <LanguageMenu
                languages={languageOptions}
                selectedLanguageId={language.id}
                disabled={isRefreshing}
                onSelect={(nextLanguage) => {
                  if (nextLanguage.id === language.id) return;
                  setStatus(GameStatus.LOADING);
                  changeLanguage(nextLanguage);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default GameView;
