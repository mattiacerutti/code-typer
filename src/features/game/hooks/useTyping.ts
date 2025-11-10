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
}

const useTyping = (props: IUseTypingProps) => {
  const {status, snippet, userPosition, autoClosingMode, onSnippetUpdate, onUserPositionChange, onStartTyping, onWrongKeystroke, onValidKeystroke} = props;

  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const registerKeyStroke = (isCorrect: boolean) => {
    if (!isCorrect) {
      onWrongKeystroke();
      return;
    }
    onValidKeystroke();
  };

  const handleKeyShortcut = (event: KeyboardEvent) => {
    let updatedSnippet = snippet;
    let newPosition = userPosition;

    if ((event.ctrlKey || event.metaKey) && event.key === "Backspace") {
      [updatedSnippet, newPosition] = deleteLine(snippet, userPosition, autoClosingMode);
    } else if (event.altKey && event.key === "Backspace") {
      [updatedSnippet, newPosition] = deleteWord(snippet, userPosition, autoClosingMode);
    }

    if (updatedSnippet !== snippet) onSnippetUpdate(updatedSnippet);
    if (newPosition !== userPosition) onUserPositionChange(newPosition);
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (hasModifierKey(event) && isAValidShortcutKey(event)) {
      handleKeyShortcut(event);
      return;
    }

    // If its a modifier key different from alt (since it could produce valid characters) we ignore it
    if (hasModifierKey(event) && !event.altKey) return;
    if (!isAValidKey(event)) return;

    let updatedSnippet = snippet;
    let newPosition = userPosition;

    if (event.key === "Backspace") {
      [updatedSnippet, newPosition] = deleteCharacter(snippet, userPosition, autoClosingMode);
    } else {
      if (status === GameStatus.READY) onStartTyping();
      [updatedSnippet, newPosition] = addCharacter(snippet, userPosition, event.key, registerKeyStroke, autoClosingMode);
    }

    if (updatedSnippet !== snippet) onSnippetUpdate(updatedSnippet);
    if (newPosition !== userPosition) onUserPositionChange(newPosition);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.getModifierState("CapsLock")) {
        setIsCapsLockOn(true);
      }
      handleKeyPress(event);
    };
    window.addEventListener("keydown", handleKeyDown);

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "CapsLock") {
        setIsCapsLockOn(false);
      }
    };
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyPress]);

  return {
    isCapsLockOn,
  };
};

export default useTyping;
