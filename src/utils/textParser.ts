import { Character, CharacterState, CharacterTypes, WhitespaceTypes } from '../models/Characters';
import { Line } from '../models/Line';

export const parseText = (originalText: string, autoClosingChars: { [key: string]: string }): Line[] => {
  const separatedLines: string[] = originalText.split("\n");

  let mostRecentAutoClosingChar: string | undefined = undefined;

  const linesArray: Line[] = separatedLines.map((text: string, index: number) => {
    const textArray: Character[] = text.split("").map((char: string) => {
      if (Object.keys(autoClosingChars).includes(char)) {
        if (autoClosingChars[char] !== char) {
          return {
            type: CharacterTypes.AutoClosing,
            value: char,
            state: CharacterState.Default,
          };
        }

        if (mostRecentAutoClosingChar === undefined) {
          mostRecentAutoClosingChar = char;
          return {
            type: CharacterTypes.AutoClosing,
            value: char,
            state: CharacterState.Default,
          };
        }

        if (mostRecentAutoClosingChar === char) {
          mostRecentAutoClosingChar = undefined;
        }
      }

      switch (char) {
        case " ":
          return {
            type: CharacterTypes.Whitespace,
            value: WhitespaceTypes.Space,
            state: CharacterState.Default,
          };

        case "\n":
          return {
            type: CharacterTypes.Whitespace,
            value: WhitespaceTypes.NewLine,
            state: CharacterState.Default,
          };

        case "\t":
          return {
            type: CharacterTypes.Whitespace,
            value: WhitespaceTypes.Tab,
            state: CharacterState.Default,
          };
        default:
          return {
            type: CharacterTypes.Normal,
            value: char,
            state: CharacterState.Default,
          };
      }
    });

    if (index < separatedLines.length - 1) {
      textArray.push({
        type: CharacterTypes.Whitespace,
        value: WhitespaceTypes.NewLine,
        state: CharacterState.Default,
      });
    } else {
      textArray.push({
        type: CharacterTypes.EOF,
        value: "EOF",
        state: CharacterState.Default,
      });
    }

    return {
      index: index,
      text: textArray,
    };
  });

  return linesArray;
};