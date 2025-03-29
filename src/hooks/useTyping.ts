import {useGameState} from "@/contexts/game-state/GameStateContext";
import {hasModifierKey, isAValidKey, isAValidShortcutKey} from "@/utils/typing/keys";
import {deleteCharacter} from "@/utils/typing/delete-character";
import {useCallback, useEffect, useState} from "react";
import {addCharacter} from "@/utils/typing/add-character";
import {deleteWord} from "@/utils/typing/delete-word";
import {deleteLine} from "@/utils/typing/delete-line";

const useTyping = (onWrongKeystroke: () => void, onValidKeystroke: () => void) => {
  const {gameState, updateParsedSnippet, updateUserPosition} = useGameState();
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
        switch (event.key) {
          case "Backspace":
            deleteLine(gameState, updateParsedSnippet, updateUserPosition);
            break;
        }
      } else if (event.altKey) {
        switch (event.key) {
          case "Backspace":
            // TODO: deleteWord(gameState, updateParsedSnippet, updateUserPosition);
            break;
        }
      }
    },
    [gameState, updateParsedSnippet, updateUserPosition]
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
          deleteCharacter(gameState, updateParsedSnippet, updateUserPosition, gameState.userPosition);
          return;
        }

        addCharacter(event.key, gameState, updateParsedSnippet, updateUserPosition, registerKeyStroke);
      }
    },
    [gameState, updateParsedSnippet, updateUserPosition, registerKeyStroke, handleKeyShortcut]
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
    };
  }, [setIsCapsLockOn, handleKeyPress]);

  return {
    isCapsLockOn,
  };
};

export default useTyping;
