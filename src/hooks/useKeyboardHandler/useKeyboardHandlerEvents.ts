import {useCallback} from "react";
import {ILine} from "@/types/Line";
import {ICharacter, CharacterState, CharacterTypes, WhitespaceTypes} from "@/types/Character";

export const useKeyboardHandlerEvents = (
  userPosition: {charIndex: number; lineIndex: number},
  incrementCursor: (position: {charIndex: number; lineIndex: number}) => {newCharIndex: number; newLineIndex: number},
  decrementCursor: (position: {charIndex: number; lineIndex: number}) => {newCharIndex: number; newLineIndex: number},
  handleCharacterValidation: (key: string, position: {charIndex: number; lineIndex: number}) => void,
  handleDecrementValidation: (position: {charIndex: number; lineIndex: number}) => void,
  lines: ILine[],
  setLines: React.Dispatch<React.SetStateAction<ILine[]>>,
  updateUserPosition: (position: {lineIndex?: number; charIndex?: number}) => void,
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

  const isFirstCharacter = useCallback(
    (userPosition: {charIndex: number; lineIndex: number}) => {
      return userPosition.charIndex === 0 || getFirstNonWhitespaceCharacter(userPosition.lineIndex) === userPosition.charIndex;
    },
    [getFirstNonWhitespaceCharacter]
  );

  const getPreviousWordPosition = useCallback(
    (userPosition: {charIndex: number; lineIndex: number}): {charIndex: number; lineIndex: number; skippedChars?: number} => {
      let {charIndex} = userPosition;
      const {lineIndex} = userPosition;

      const text = lines[lineIndex].text;

      if (charIndex === 0) return {...userPosition, skippedChars: 0};

      let skippedChars = 0;

      // Skip over the previous whitespace
      while (charIndex > 0 && text[charIndex - 1].type === CharacterTypes.Whitespace) {
        charIndex--;
        skippedChars++;
      }

      if (skippedChars > 0) return {charIndex, lineIndex, skippedChars};

      // Skip over the previous word
      while (charIndex > 0 && text[charIndex - 1].type !== CharacterTypes.Whitespace) {
        charIndex--;
      }

      return {charIndex, lineIndex};
    },
    [lines]
  );

  const deleteLine = useCallback(
    (userPosition: {charIndex: number; lineIndex: number}) => {
      if (isFirstCharacter(userPosition)) {
        if (userPosition.lineIndex === 0) return;

        const newCharIndex = lines[userPosition.lineIndex - 1].text.length - 1;
        const newLineIndex = userPosition.lineIndex - 1;

        lines[newLineIndex].text[lines[newLineIndex].text.length - 1].state = CharacterState.Default;
        setLines([...lines]);
        updateUserPosition({lineIndex: newLineIndex, charIndex: newCharIndex});
        return;
      }
      lines[userPosition.lineIndex].text.map((char: ICharacter) => {
        char.state = CharacterState.Default;
      });
      setLines([...lines]);
      updateUserPosition({charIndex: getFirstNonWhitespaceCharacter(userPosition.lineIndex)});
    },
    [lines, setLines, updateUserPosition, getFirstNonWhitespaceCharacter, isFirstCharacter]
  );

  const deleteWord = useCallback(
    (userPosition: {charIndex: number; lineIndex: number}) => {
      if (isFirstCharacter(userPosition)) {
        if (userPosition.lineIndex === 0) return;

        const newCharIndex = lines[userPosition.lineIndex - 1].text.length - 1;
        const newLineIndex = userPosition.lineIndex - 1;

        lines[newLineIndex].text[lines[newLineIndex].text.length - 1].state = CharacterState.Default;
        setLines([...lines]);
        updateUserPosition({lineIndex: newLineIndex, charIndex: newCharIndex});
        return;
      }

      let skippedChars;
      let newCharIndex = userPosition.charIndex;

      do {
        const previousWordPosition = getPreviousWordPosition({charIndex: newCharIndex, lineIndex: userPosition.lineIndex});
        skippedChars = previousWordPosition.skippedChars;

        newCharIndex = previousWordPosition.charIndex;
      } while (skippedChars && skippedChars <= 1);

      for (let i = newCharIndex; i < lines[userPosition.lineIndex].text.length; i++) {
        lines[userPosition.lineIndex].text[i].state = CharacterState.Default;
      }

      setLines([...lines]);
      updateUserPosition({charIndex: newCharIndex});
    },
    [isFirstCharacter, setLines, lines, updateUserPosition, getPreviousWordPosition]
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
            deleteWord(userPosition);
            break;
        }
      }
    },
    [deleteLine, deleteWord, userPosition]
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
    [handleKeyShortcut, handleCharacterValidation, userPosition, incrementCursor, decrementCursor, handleDecrementValidation]);

  return {handleKeyPress};
};
