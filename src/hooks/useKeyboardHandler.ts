import {useCallback, useEffect, useMemo} from "react";
import {Character, CharacterState, CharacterTypes, WhitespaceTypes} from "../models/Characters";
import { Line } from '../models/Line';

const useKeyboardHandler = (lines: Line[], setLines: React.Dispatch<React.SetStateAction<Line[]>>, autoClosingChars: {[key: string]: string}) => {
   const userPosition = useMemo(
      () => ({
         charIndex: 0,
         lineIndex: 0,
      }),
      []
   );

   const resetKeyState = useCallback(
      (lineIndex: number, charIndex: number) => {
         lines[lineIndex].text[charIndex].state = CharacterState.Default;
         setLines([...lines]);
      },
      [lines, setLines]
   );

   const getChar = useCallback(
      (lineIndex: number = userPosition.lineIndex, charIndex: number = userPosition.charIndex) => {
         return lines[lineIndex].text[charIndex];
      },
      [lines, userPosition]
   );

   const getClosingCharacter = useCallback(
      (char: string, charIndex: number, lineIndex: number) => {
         let cont = 1;
         let startingChar = charIndex + 1;

         for (let i = lineIndex; i < lines.length; i++) {
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

   const incrementCursor = useCallback(() => {
      if (userPosition.charIndex < lines[userPosition.lineIndex].text.length - 1) {
         userPosition.charIndex++;
      } else if (userPosition.lineIndex !== lines.length - 1) {
         userPosition.lineIndex++;
         userPosition.charIndex = 0;
      }

      if (getChar().value === WhitespaceTypes.Tab || getChar().state === CharacterState.Right) {
         incrementCursor();
      }
   }, [lines, userPosition, getChar]);

   const handleDecrementValidation = useCallback(() => {
      const currentChar = getChar();

      if (currentChar.type === CharacterTypes.AutoClosing) {
         const closingParenthesis = getClosingCharacter(currentChar.value, userPosition.charIndex, userPosition.lineIndex);
         if (closingParenthesis) {
            closingParenthesis.state = CharacterState.Default;
         } else {
            throw new Error("Couldn't find a closing parenthesis");
         }
      }

      resetKeyState(userPosition.lineIndex, userPosition.charIndex);
   }, [userPosition, getChar, getClosingCharacter, resetKeyState]);

   const decrementCursor = useCallback(() => {
      if (userPosition.charIndex > 0) {
         userPosition.charIndex--;
      } else if (userPosition.lineIndex !== 0) {
         userPosition.lineIndex--;
         userPosition.charIndex = lines[userPosition.lineIndex].text.length - 1;
      }

      if (getChar().value === WhitespaceTypes.Tab) {
         decrementCursor();
      }
   }, [lines, userPosition, getChar]);

   const isCharacterMatch = (key: string, currentCharValue: string): boolean => {
      return key === currentCharValue;
   };

   const handleAutoClosingCharacter = useCallback(
      (key: string, userPosition: {charIndex: number; lineIndex: number}): boolean => {
         const currentCharType = getChar(userPosition.lineIndex, userPosition.charIndex).type;
         if (currentCharType === CharacterTypes.AutoClosing) {
            const closingParenthesis = getClosingCharacter(key, userPosition.charIndex, userPosition.lineIndex);
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
         const selectedChar: Character = getChar(userPosition.lineIndex, userPosition.charIndex);
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
      (key: string) => {
         const currentCharValue = getChar().value;

         if (currentCharValue === "EOF") return;

         if (key === "Enter") {
            key = "\n";
         }

         const isMatch = isCharacterMatch(key, currentCharValue);

         if (isMatch) {
            handleAutoClosingCharacter(key, userPosition);
         }

         setCharacterState(isMatch, userPosition);
      },
      [userPosition, handleAutoClosingCharacter, setCharacterState, getChar]
   );

   const handleKeyPress = useCallback(
      (event: KeyboardEvent) => {
         if (event.key.length === 1 || event.key === "Enter" || event.key === "Backspace") {
            switch (event.key) {
               case "Backspace":
                  decrementCursor();
                  handleDecrementValidation();
                  break;

               default:
                  handleCharacterValidation(event.key);
                  incrementCursor();
                  break;
            }
         }
      },
      [incrementCursor, decrementCursor, handleCharacterValidation, handleDecrementValidation]
   );

   // Initializes the event listeners for keyboard events
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
