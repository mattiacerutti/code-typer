import {useCallback} from "react";
import {Line} from "@/models/Line";
import {Character, CharacterState, WhitespaceTypes} from "@/models/Characters";

export const useKeyboardHandlerEvents = (
   userPosition: {charIndex: number; lineIndex: number},
   incrementCursor: (position: {charIndex: number; lineIndex: number}) => {newCharIndex: number; newLineIndex: number},
   decrementCursor: (position: {charIndex: number; lineIndex: number}) => {newCharIndex: number; newLineIndex: number},
   handleCharacterValidation: (key: string, position: {charIndex: number; lineIndex: number}) => void,
   handleDecrementValidation: (position: {charIndex: number; lineIndex: number}) => void,
   lines: Line[],
   setLines: React.Dispatch<React.SetStateAction<Line[]>>,
   updateUserPosition: (position: {lineIndex?: number; charIndex?: number}) => void
) => {
   const hasModifierKey = (event: KeyboardEvent) => {
      return event.altKey || event.ctrlKey || event.metaKey || event.key === "Fn" || event.key === "Function";
   };

   const isAValidKey = (event: KeyboardEvent) => {
      const validExtraKeys = ["Enter", "Backspace"];
      return event.key.length === 1 || validExtraKeys.includes(event.key);
   };

   const isAValidShortcutKey = (event: KeyboardEvent) => {
      const validShortcutKeys = ["Backspace"];
      return validShortcutKeys.includes(event.key);
   };

   const getFirstNonWhitespaceCharacter = useCallback(
      (lineIndex: number) => {
         for (let i = 0; i < lines[lineIndex].text.length; i++) {
            if (lines[lineIndex].text[i].value !== WhitespaceTypes.Tab) {
               return i;
            }
         }
         return 0;
      },
      [lines]
   );

   const deleteLine = useCallback(
      (userPosition: {charIndex: number; lineIndex: number}) => {
         if (userPosition.charIndex === 0 || getFirstNonWhitespaceCharacter(userPosition.lineIndex) === userPosition.charIndex) {
            if (userPosition.lineIndex === 0) return;

            const newCharIndex = lines[userPosition.lineIndex - 1].text.length - 1;
            const newLineIndex = userPosition.lineIndex - 1;

            lines[newLineIndex].text[lines[newLineIndex].text.length - 1].state = CharacterState.Default;
            setLines([...lines]);
            updateUserPosition({lineIndex: newLineIndex, charIndex: newCharIndex});
            return;
         }
         lines[userPosition.lineIndex].text.map((char: Character) => {
            char.state = CharacterState.Default;
         });
         setLines([...lines]);
         updateUserPosition({charIndex: getFirstNonWhitespaceCharacter(userPosition.lineIndex)});
      },
      [lines, setLines, updateUserPosition, getFirstNonWhitespaceCharacter]
   );

   const handleKeyShortcut = useCallback(
      (event: KeyboardEvent) => {
         if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
               case "Backspace":
                  deleteLine(userPosition);
                  break;
            }
         } else if (event.altKey) {
            switch (event.key) {
               case "Backspace":
                  console.log("Whole word deleted");
                  break;
            }
         }
      },
      [deleteLine, userPosition]
   );

   const handleKeyPress = useCallback(
      (event: KeyboardEvent) => {
         if (hasModifierKey(event)) {
            if (isAValidShortcutKey(event)) {
               handleKeyShortcut(event);
               return;
            }
            if (!event.altKey) {
               return;
            }
         }

         if (isAValidKey(event)) {
            if (event.key === "Backspace") {
               const {newCharIndex, newLineIndex} = decrementCursor(userPosition);
               handleDecrementValidation({charIndex: newCharIndex, lineIndex: newLineIndex});
               return;
            }

            handleCharacterValidation(event.key, userPosition);
            incrementCursor(userPosition);
         }
      },
      [incrementCursor, decrementCursor, handleCharacterValidation, handleDecrementValidation, handleKeyShortcut, userPosition]
   );

   return {handleKeyPress};
};
