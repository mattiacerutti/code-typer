import {useCallback, useEffect, useState} from "react";
import {hasModifierKey, isAValidKey, isAValidShortcutKey} from "@/features/game/logic/typing/keys";
import {deleteCharacter} from "@/features/game/logic/typing/delete-character";
import {addCharacter} from "@/features/game/logic/typing/add-character";
import {deleteWord} from "@/features/game/logic/typing/delete-word";
import {deleteLine} from "@/features/game/logic/typing/delete-line";
import {GameStatus} from "@/features/game/types/game-state";
import type {IParsedSnippet} from "@/shared/types/snippet";

interface IUseTypingProps {
  status: GameStatus;
  snippet: IParsedSnippet;
  userPosition: number;
  onSnippetUpdate: (parsedSnippet: IParsedSnippet) => void;
  onUserPositionChange: (position: number) => void;
  onStartTyping: () => void;
  onWrongKeystroke: () => void;
  onValidKeystroke: () => void;
}

const useTyping = (props: IUseTypingProps) => {
  const {status, snippet, userPosition, onSnippetUpdate, onUserPositionChange, onStartTyping, onWrongKeystroke, onValidKeystroke} = props;

  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const registerKeyStroke = useCallback(
    (isCorrect: boolean) => {
      if (!isCorrect) {
        onWrongKeystroke();
        return;
      }
      onValidKeystroke();
    },
    [onWrongKeystroke, onValidKeystroke]
  );

  const handleKeyShortcut = useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "Backspace") {
          deleteLine(snippet, userPosition, onSnippetUpdate, onUserPositionChange);
        }
      } else if (event.altKey && event.key === "Backspace") {
        deleteWord(snippet, userPosition, onSnippetUpdate, onUserPositionChange);
      }
    },
    [snippet, userPosition, onSnippetUpdate, onUserPositionChange]
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const isShortcut = hasModifierKey(event) && isAValidShortcutKey(event);
      if (isShortcut) {
        handleKeyShortcut(event);
        return;
      }

      if (hasModifierKey(event) && !event.altKey) {
        return;
      }

      if (isAValidKey(event)) {
        if (event.key === "Backspace") {
          deleteCharacter(snippet, userPosition, onSnippetUpdate, onUserPositionChange);
          return;
        }

        if (status === GameStatus.READY) {
          onStartTyping();
        }

        addCharacter(snippet, userPosition, event.key, onSnippetUpdate, onUserPositionChange, registerKeyStroke);
      }
    },
    [status, snippet, userPosition, onSnippetUpdate, onUserPositionChange, registerKeyStroke, handleKeyShortcut, onStartTyping]
  );

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
