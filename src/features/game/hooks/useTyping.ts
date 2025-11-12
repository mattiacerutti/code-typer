import {useEffect, useState} from "react";
import {hasModifierKey, isAValidKey, isAValidShortcutKey} from "@/features/game/logic/typing/keys";
import {deleteCharacter} from "@/features/game/logic/typing/delete-character";
import {addCharacter} from "@/features/game/logic/typing/add-character";
import {deleteWord} from "@/features/game/logic/typing/delete-word";
import {deleteLine} from "@/features/game/logic/typing/delete-line";
import {GameStatus} from "@/features/game/types/game-status";
import type {IParsedSnippet} from "@/shared/types/snippet";
import {AutoClosingMode} from "@/features/settings/types/autoclosing-mode";

interface IUseTypingProps {
  status: GameStatus;
  snippet: IParsedSnippet;
  userPosition: number;
  autoClosingMode: AutoClosingMode;
  onSnippetUpdate: (parsedSnippet: IParsedSnippet) => void;
  onUserPositionChange: (position: number) => void;
  onStartTyping: () => void;
  onWrongKeystroke: () => void;
  onValidKeystroke: () => void;
  hiddenInputRef: React.RefObject<HTMLInputElement | null>;
}

const useTyping = (props: IUseTypingProps) => {
  const {status, snippet, userPosition, autoClosingMode, onSnippetUpdate, onUserPositionChange, onStartTyping, onWrongKeystroke, onValidKeystroke, hiddenInputRef} = props;

  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const registerKeyStroke = (isCorrect: boolean) => {
    if (!isCorrect) {
      onWrongKeystroke();
      return;
    }
    onValidKeystroke();
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Dead") return;

    if (event.getModifierState("CapsLock")) {
      setIsCapsLockOn(true);
    }

    // If its a modifier key different from alt (since it could produce valid characters) or its a backspace modifier we ignore it
    if (hasModifierKey(event) && (!event.altKey || event.key === "Backspace")) return;
    if (!isAValidKey(event)) return;

    let newPosition = userPosition;
    let newSnippet = snippet;

    if (event.key === "Backspace") {
      [newSnippet, newPosition] = deleteCharacter(snippet, userPosition, autoClosingMode);
    } else {
      if (status === GameStatus.READY) onStartTyping();
      [newSnippet, newPosition] = addCharacter(snippet, userPosition, event.key, registerKeyStroke, autoClosingMode);
    }

    if (newSnippet !== snippet) onSnippetUpdate(newSnippet);
    if (newPosition !== userPosition) onUserPositionChange(newPosition);
  };

  const handleInput = (event: InputEvent) => {
    if (!isAValidShortcutKey(event)) return;

    let newSnippet = snippet;
    let newPosition = userPosition;

    if (event.inputType === "deleteWordBackward") {
      [newSnippet, newPosition] = deleteWord(snippet, userPosition, autoClosingMode);
    } else if (event.inputType === "deleteSoftLineBackward") {
      [newSnippet, newPosition] = deleteLine(snippet, userPosition, autoClosingMode);
    }

    if (newSnippet !== snippet) onSnippetUpdate(newSnippet);
    if (newPosition !== userPosition) onUserPositionChange(newPosition);
  };

  useEffect(() => {
    const hiddenInput = hiddenInputRef.current;
    if (!hiddenInput) return;

    const handleReFocus = () => {
      if (hiddenInput !== document.activeElement) {
        hiddenInput.focus();
        return;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "CapsLock") {
        setIsCapsLockOn(false);
      }
    };

    hiddenInput.addEventListener("keydown", handleKeyDown);
    hiddenInput.addEventListener("keyup", handleKeyUp);
    hiddenInput.addEventListener("input", handleInput as EventListener);
    window.addEventListener("keydown", handleReFocus);

    return () => {
      hiddenInput.removeEventListener("keydown", handleKeyDown);
      hiddenInput.removeEventListener("keyup", handleKeyUp);
      hiddenInput.removeEventListener("input", handleInput as EventListener);
      window.removeEventListener("keydown", handleReFocus);
    };
  }, [handleKeyDown, handleInput, hiddenInputRef]);

  return {
    isCapsLockOn,
  };
};

export default useTyping;
