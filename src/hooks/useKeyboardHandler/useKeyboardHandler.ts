import {useEffect} from "react";
import {Line} from "../../models/Line";
import {useKeyboardHandlerState} from "./useKeyboardHandlerState";
import {useKeyboardHandlerUtils} from "./useKeyboardHandlerUtils";
import {useKeyboardHandlerEvents} from "./useKeyboardHandlerEvents";

const useKeyboardHandler = (lines: Line[], setLines: React.Dispatch<React.SetStateAction<Line[]>>, autoClosingChars: {[key: string]: string}) => {
   const {userPosition, updateUserPosition} = useKeyboardHandlerState();
   const {incrementCursor, decrementCursor, handleCharacterValidation, handleDecrementValidation} = useKeyboardHandlerUtils(
      lines,
      setLines,
      autoClosingChars,
      updateUserPosition,
   );

   const {handleKeyPress} = useKeyboardHandlerEvents(userPosition, incrementCursor, decrementCursor, handleCharacterValidation, handleDecrementValidation, lines, setLines, updateUserPosition);

   useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
         handleKeyPress(event);
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
         window.removeEventListener("keydown", handleKeyDown);
      };
   }, [handleKeyPress]);

   return {userPosition, incrementCursor};
};

export default useKeyboardHandler;
