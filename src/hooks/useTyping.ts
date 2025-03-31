import {useGameState} from "@/contexts/GameStateContext";
import {hasModifierKey, isAValidKey, isAValidShortcutKey} from "@/utils/typing/keys";
import {deleteCharacter} from "@/utils/typing/delete-character";
import {useCallback, useEffect, useState} from "react";
import {addCharacter} from "@/utils/typing/add-character";
import {deleteWord} from "@/utils/typing/delete-word";
import {deleteLine} from "@/utils/typing/delete-line";
import { ISnippet } from "@/types/snippet";

const useTyping = (onWrongKeystroke: () => void, onValidKeystroke: () => void) => {
  const {state, dispatch} = useGameState();
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const updateParsedSnippet = useCallback((parsedSnippet: ISnippet) => {
    dispatch({type: "UPDATE_PARSED_SNIPPET", payload: parsedSnippet});
  }, [dispatch])

  const updateUserPosition = useCallback((position: number) => {
    dispatch({type: "UPDATE_USER_POSITION", payload: position});
  }, [dispatch])

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
            deleteLine(state, (updateParsedSnippet), updateUserPosition);
            break;
        }
      } else if (event.altKey) {
        switch (event.key) {
          case "Backspace":
            deleteWord(state, updateParsedSnippet, updateUserPosition);
            break;
        }
      }
    },
    [state, updateParsedSnippet, updateUserPosition]
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
          deleteCharacter(state.snippet!.parsedSnippet, state.userPosition, updateParsedSnippet, updateUserPosition);
          return;
        }

        addCharacter(state, event.key, updateParsedSnippet, updateUserPosition, registerKeyStroke);
      }
    },
    [state, updateParsedSnippet, updateUserPosition, registerKeyStroke, handleKeyShortcut]
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
