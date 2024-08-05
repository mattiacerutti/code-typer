import {useCallback} from "react";
import {ILine} from "@/types/Line";
import {ICharacter, CharacterState, CharacterTypes, WhitespaceTypes} from "@/types/Character";
import { AUTO_CLOSING_CHARS, SHOULD_PRESERVE_CLOSING_CHAR_WHEN_DELETING } from "@/utils/constants";

export const useKeyboardHandlerUtils = (
  lines: ILine[],
  updateSnippetLines: (lines: ILine[]) => void,
  updateUserPosition: (position: {lineIndex?: number; charIndex?: number}) => void,
  onWrongKeystroke: () => void
) => {
  const getChar = useCallback(
    (userPosition: {lineIndex: number; charIndex: number}) => {
      return lines[userPosition.lineIndex].text[userPosition.charIndex];
    },
    [lines]
  );

  // For future settings support

  const getPreviousChar = useCallback(
    (userPosition: {lineIndex: number; charIndex: number}) => {
      let prevChar;
      if (userPosition.charIndex === 0) {
        if (userPosition.lineIndex === 0) {
          return prevChar;
        }
        prevChar = getChar({lineIndex: userPosition.lineIndex - 1, charIndex: lines[userPosition.lineIndex - 1].text.length - 1});
        if (prevChar.value === WhitespaceTypes.Tab) {
          return getPreviousChar({lineIndex: userPosition.lineIndex - 1, charIndex: lines[userPosition.lineIndex - 1].text.length - 1});
        }
        return prevChar;
      }
      prevChar = getChar({lineIndex: userPosition.lineIndex, charIndex: userPosition.charIndex - 1});
      if (prevChar.value === WhitespaceTypes.Tab) {
        return getPreviousChar({lineIndex: userPosition.lineIndex, charIndex: userPosition.charIndex - 1});
      }
      return prevChar;
    },
    [lines, getChar]
  );

  const isClosingCharacter = useCallback(
    (char: ICharacter): boolean => {
      return Object.values(AUTO_CLOSING_CHARS).includes(char.value) && char.type === CharacterTypes.Normal;
    },
    []
  );

  const getClosingCharacter = useCallback(
    (char: string, userPosition: {charIndex: number; lineIndex: number}) => {
      let cont = 1;
      let startingChar = userPosition.charIndex + 1;

      for (let i = userPosition.lineIndex; i < lines.length; i++) {
        for (let j = startingChar; j < lines[i].text.length; j++) {
          const currentChar = lines[i].text[j];
          if (currentChar.value === AUTO_CLOSING_CHARS[char]) {
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
    [lines]
  );

  const resetKeyState = useCallback(
    (userPosition: {lineIndex: number; charIndex: number}) => {
      lines[userPosition.lineIndex].text[userPosition.charIndex].state = CharacterState.Default;
      updateSnippetLines([...lines]);
    },
    [lines, updateSnippetLines]
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
    [getChar, hasOnlyWhitespacesBefore, isClosingCharacter, updateUserPosition, lines]
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
      updateSnippetLines([...lines]);
    },
    [lines, updateSnippetLines, getChar]
  );

  const handleCharacterValidation = useCallback(
    (key: string, userPosition: {charIndex: number; lineIndex: number}) => {
      const currentCharValue = getChar(userPosition).value;

      if (currentCharValue === "EOF") return;

      if (key === "Enter") {
        key = "\n";
      }

      const prevChar = getPreviousChar(userPosition);
      if (prevChar && prevChar.state === CharacterState.Wrong) {
        onWrongKeystroke();
        setCharacterState(false, userPosition);
        return;
      }

      const isMatch = isCharacterMatch(key, currentCharValue);

      if (isMatch) {
        handleAutoClosingCharacter(key, userPosition);
      } else {
        onWrongKeystroke();
      }

      setCharacterState(isMatch, userPosition);
    },
    [handleAutoClosingCharacter, setCharacterState, getChar, onWrongKeystroke, getPreviousChar]
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
