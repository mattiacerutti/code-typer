import {useEffect} from "react";
import {ITextLine} from "@/types/text-line";
import {useKeyboardHandlerUtils} from "./useKeyboardHandlerUtils";
import {useKeyboardHandlerEvents} from "./useKeyboardHandlerEvents";

const useKeyboardHandler = (
  lines: ITextLine[],
  updateSnippetLines: (lines: ITextLine[]) => void,
  userPosition: {lineIndex: number; charIndex: number},
  updateUserPosition: (position: {lineIndex?: number; charIndex?: number}) => void,
  setIsCapsLockOn: React.Dispatch<React.SetStateAction<boolean>>,
  onWrongKeystroke: () => void,
  onValidKeystroke: () => void
) => {

  const {incrementCursor, decrementCursor, handleCharacterValidation, handleDecrementValidation} = useKeyboardHandlerUtils(
    lines,
    updateSnippetLines,
    updateUserPosition,
    onWrongKeystroke,
  );

  const {handleKeyPress} = useKeyboardHandlerEvents(
    userPosition,
    incrementCursor,
    decrementCursor,
    handleCharacterValidation,
    handleDecrementValidation,
    lines,
    updateSnippetLines,
    updateUserPosition,
    onValidKeystroke
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
  }, [handleKeyPress, setIsCapsLockOn]);

  return {userPosition, incrementCursor};
};

export default useKeyboardHandler;
