import {useGameState} from "@/features/game/state/GameStateContext";
import {hasModifierKey, isAValidKey, isAValidShortcutKey} from "@/features/game/logic/typing/keys";
import {deleteCharacter} from "@/features/game/logic/typing/delete-character";
import {useCallback, useEffect, useState} from "react";
import {addCharacter} from "@/features/game/logic/typing/add-character";
import {deleteWord} from "@/features/game/logic/typing/delete-word";
import {deleteLine} from "@/features/game/logic/typing/delete-line";
import {IParsedSnippet} from "@/shared/types/snippet";
import {GameStatus} from "@/features/game/types/game-state";

interface IUseTypingProps {
  onWrongKeystroke: () => void;
  onValidKeystroke: () => void;
  onStartTyping: () => void;
}

const useTyping = (props: IUseTypingProps) => {
  const {onWrongKeystroke, onValidKeystroke, onStartTyping} = props;
  const {state, dispatch} = useGameState();
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  if (state.status !== GameStatus.PLAYING && state.status !== GameStatus.READY) {
    throw new Error("Typing: Received invalid game status");
  }

  const updateParsedSnippet = useCallback(
    (parsedSnippet: IParsedSnippet) => {
      dispatch({type: "UPDATE_CURRENT_SNIPPET", payload: parsedSnippet});
    },
    [dispatch]
  );

  const updateUserPosition = useCallback(
    (position: number) => {
      dispatch({type: "UPDATE_USER_POSITION", payload: position});
    },
    [dispatch]
  );

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
            deleteLine(state, updateParsedSnippet, updateUserPosition);
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
          deleteCharacter(state.currentSnippet.parsedSnippet, state.userPosition, updateParsedSnippet, updateUserPosition);
          return;
        }

        if (state.status === GameStatus.READY) {
          onStartTyping();
        }

        addCharacter(state, event.key, updateParsedSnippet, updateUserPosition, registerKeyStroke);
      }
    },
    [state, updateParsedSnippet, updateUserPosition, registerKeyStroke, handleKeyShortcut, onStartTyping]
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
