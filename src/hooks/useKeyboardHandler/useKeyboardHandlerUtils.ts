import {useCallback} from "react";
import {ILine} from "@/models/Line";
import {ICharacter, CharacterState, CharacterTypes, WhitespaceTypes} from "@/models/Character";

export const useKeyboardHandlerUtils = (
   lines: ILine[],
   setLines: React.Dispatch<React.SetStateAction<ILine[]>>,
   autoClosingChars: {[key: string]: string},
   updateUserPosition: (position: {lineIndex?: number; charIndex?: number}) => void
) => {
   const getChar = useCallback(
      (userPosition: {lineIndex: number; charIndex: number}) => {
         return lines[userPosition.lineIndex].text[userPosition.charIndex];
      },
      [lines]
   );

   // For future settings support
   const SHOULD_PRESERVE_CLOSING_CHAR_WHEN_DELETING = true;

   const isClosingCharacter = useCallback(
      (char: ICharacter): boolean => {
         return Object.values(autoClosingChars).includes(char.value) && char.type === CharacterTypes.Normal;
      },
      [autoClosingChars]
   );

   const getClosingCharacter = useCallback(
      (char: string, userPosition: {charIndex: number; lineIndex: number}) => {
         let cont = 1;
         let startingChar = userPosition.charIndex + 1;

         for (let i = userPosition.lineIndex; i < lines.length; i++) {
            for (let j = startingChar; j < lines[i].text.length; j++) {
               const currentChar = lines[i].text[j];
               if (currentChar.value === autoClosingChars[char]) {
                  cont--;
                  if (cont === 0) {
                     return currentChar;
                  }
               }
               if (currentChar.value === char) {
                  cont++;
                  continue;
               }
            }
            startingChar = 0;
         }
         return undefined;
      },
      [lines, autoClosingChars]
   );

   const resetKeyState = useCallback(
      (userPosition: {lineIndex: number; charIndex: number}) => {
         lines[userPosition.lineIndex].text[userPosition.charIndex].state = CharacterState.Default;
         setLines([...lines]);
      },
      [lines, setLines]
   );

   const hasOnlyWhitespacesBefore = useCallback(
      (charIndex: number, lineIndex: number) => {
         for (let i = charIndex - 1; i >= 0; i--) {
            if (getChar({lineIndex, charIndex: i}).type !== CharacterTypes.Whitespace) {
               return false;
            }
         }
         return true;
      },
      [getChar]
   );

   const incrementCursor = useCallback(
      (userPosition: {charIndex: number; lineIndex: number}): {newCharIndex: number; newLineIndex: number} => {
         let newCharIndex = userPosition.charIndex;
         let newLineIndex = userPosition.lineIndex;

         if (newCharIndex < lines[newLineIndex].text.length - 1) {
            newCharIndex++;
         } else if (newLineIndex !== lines.length - 1) {
            newCharIndex = 0;
            newLineIndex++;
         }

         const oldChar = getChar(userPosition);
         const newChar = getChar({lineIndex: newLineIndex, charIndex: newCharIndex});

         if (
            (newChar.type === CharacterTypes.Whitespace && hasOnlyWhitespacesBefore(newCharIndex, newLineIndex)) ||
            (oldChar.value == WhitespaceTypes.NewLine && newChar.value == WhitespaceTypes.NewLine) ||
            newChar.state === CharacterState.Right
         ) {
            return incrementCursor({charIndex: newCharIndex, lineIndex: newLineIndex});
         }

         updateUserPosition({charIndex: newCharIndex, lineIndex: newLineIndex});

         return {newCharIndex, newLineIndex};
      },
      [lines, getChar, hasOnlyWhitespacesBefore, updateUserPosition]
   );

   const decrementCursor = useCallback(
      (userPosition: {charIndex: number; lineIndex: number}): {newCharIndex: number; newLineIndex: number} => {
         let newCharIndex = userPosition.charIndex;
         let newLineIndex = userPosition.lineIndex;

         if (newCharIndex > 0) {
            newCharIndex--;
         } else if (newLineIndex !== 0) {
            newLineIndex--;
            newCharIndex = lines[newLineIndex].text.length - 1;
         }

         const newChar = getChar({lineIndex: newLineIndex, charIndex: newCharIndex});

         if (
            (newChar.type === CharacterTypes.Whitespace && hasOnlyWhitespacesBefore(newCharIndex, newLineIndex)) ||
            (newChar.value == WhitespaceTypes.NewLine && newCharIndex == 0) ||
            (SHOULD_PRESERVE_CLOSING_CHAR_WHEN_DELETING && newChar.state === CharacterState.Right && isClosingCharacter(newChar))
         ) {
            return decrementCursor({charIndex: newCharIndex, lineIndex: newLineIndex});
         }

         updateUserPosition({charIndex: newCharIndex, lineIndex: newLineIndex});

         return {newCharIndex, newLineIndex};
      },
      [getChar, hasOnlyWhitespacesBefore, SHOULD_PRESERVE_CLOSING_CHAR_WHEN_DELETING, isClosingCharacter, updateUserPosition, lines]
   );

   const isCharacterMatch = (key: string, currentCharValue: string): boolean => {
      return key === currentCharValue;
   };

   const handleAutoClosingCharacter = useCallback(
      (key: string, userPosition: {charIndex: number; lineIndex: number}): boolean => {
         const currentCharType = getChar(userPosition).type;

         if (currentCharType === CharacterTypes.AutoClosing) {
            const closingParenthesis = getClosingCharacter(key, userPosition);
            if (closingParenthesis) {
               closingParenthesis.state = CharacterState.Right;
               return true;
            } else {
               throw new Error("Couldn't find a closing parenthesis");
            }
         }
         return false;
      },
      [getClosingCharacter, getChar]
   );

   const setCharacterState = useCallback(
      (isMatch: boolean, userPosition: {charIndex: number; lineIndex: number}): void => {
         const selectedChar: ICharacter = getChar(userPosition);
         if (isMatch) {
            selectedChar.state = CharacterState.Right;
         } else {
            selectedChar.state = CharacterState.Wrong;
         }
         setLines([...lines]);
      },
      [lines, setLines, getChar]
   );

   const handleCharacterValidation = useCallback(
      (key: string, userPosition: {charIndex: number; lineIndex: number}) => {
         const currentCharValue = getChar(userPosition).value;

         if (currentCharValue === "EOF") return;

         if (key === "Enter") {
            key = "\n";
         }

         const prevChar = getChar({
            charIndex: userPosition.charIndex - 1,
            lineIndex: userPosition.lineIndex,
         });
         if (prevChar && prevChar.state === CharacterState.Wrong) {
            setCharacterState(false, userPosition);
            return;
         }

         const isMatch = isCharacterMatch(key, currentCharValue);

         if (isMatch) {
            handleAutoClosingCharacter(key, userPosition);
         }

         setCharacterState(isMatch, userPosition);
      },
      [handleAutoClosingCharacter, setCharacterState, getChar]
   );

   const handleDecrementValidation = useCallback(
      (userPosition: {charIndex: number; lineIndex: number}) => {
         const currentChar = getChar(userPosition);

         if (currentChar.type === CharacterTypes.AutoClosing) {
            const closingParenthesis = getClosingCharacter(currentChar.value, userPosition);
            if (closingParenthesis) {
               closingParenthesis.state = CharacterState.Default;
            } else {
               throw new Error("Couldn't find a closing parenthesis");
            }
         }

         resetKeyState(userPosition);
      },
      [getChar, getClosingCharacter, resetKeyState]
   );

   return {
      getChar,
      getClosingCharacter,
      incrementCursor,
      decrementCursor,
      handleCharacterValidation,
      handleDecrementValidation,
   };
};
