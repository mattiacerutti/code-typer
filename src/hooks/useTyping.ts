import {useGameState} from "@/contexts/game-state/GameStateContext";
import {hasModifierKey, isAValidKey, isAValidShortcutKey} from "@/utils/typing/keys";
import {deleteCharacter} from "@/utils/typing/delete-character";
import {useCallback, useEffect, useState} from "react";
import {addCharacter} from "@/utils/typing/add-character";
import {deleteWord} from "@/utils/typing/delete-word";
import {deleteLine} from "@/utils/typing/delete-line";
/*
//TODO:

Do more tests
Convert position from line-char to single index
Implement capslock
*/

const useTyping = (onWrongKeystroke: () => void, onValidKeystroke: () => void) => {
  const {gameState, updateSnippetLines, updateUserPosition} = useGameState();
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
            deleteLine(gameState, updateSnippetLines, updateUserPosition);
            break;
        }
      } else if (event.altKey) {
        switch (event.key) {
          case "Backspace":
            deleteWord(gameState, updateSnippetLines, updateUserPosition);
            break;
        }
      }
    },
    [gameState, updateSnippetLines, updateUserPosition]
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
          deleteCharacter(gameState, updateSnippetLines, updateUserPosition);
          return;
        }

        addCharacter(event.key, gameState, updateSnippetLines, updateUserPosition, registerKeyStroke);
      }
    },
    [gameState, updateSnippetLines, updateUserPosition, registerKeyStroke, handleKeyShortcut]
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
