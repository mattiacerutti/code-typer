import {useEffect} from "react";
import {ILine} from "@/types/Line";
import {useKeyboardHandlerState} from "./useKeyboardHandlerState";
import {useKeyboardHandlerUtils} from "./useKeyboardHandlerUtils";
import {useKeyboardHandlerEvents} from "./useKeyboardHandlerEvents";

const useKeyboardHandler = (
  lines: ILine[],
  setLines: React.Dispatch<React.SetStateAction<ILine[]>>,
  autoClosingChars: {[key: string]: string},
  setIsCapsLockOn: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const {userPosition, updateUserPosition} = useKeyboardHandlerState();
  const {incrementCursor, decrementCursor, handleCharacterValidation, handleDecrementValidation} = useKeyboardHandlerUtils(lines, setLines, autoClosingChars, updateUserPosition);

  const {handleKeyPress} = useKeyboardHandlerEvents(
    userPosition,
    incrementCursor,
    decrementCursor,
    handleCharacterValidation,
    handleDecrementValidation,
    lines,
    setLines,
    updateUserPosition
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.getModifierState('CapsLock')) {
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
