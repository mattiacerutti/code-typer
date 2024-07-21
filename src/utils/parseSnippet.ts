import { ICharacter, CharacterState, CharacterTypes, WhitespaceTypes } from '../models/Character';
import { ILine } from '../models/Line';

export const parseSnippet = (originalText: string, autoClosingChars: { [key: string]: string }): ILine[] => {
  const separatedLines: string[] = originalText.split("\n");

  let mostRecentAutoClosingChar: string | undefined = undefined;

  const linesArray: ILine[] = separatedLines.map((text: string, index: number) => {
    const textArray: ICharacter[] = text.split("").map((char: string) => {
      if (Object.keys(autoClosingChars).includes(char)) {
        if (autoClosingChars[char] !== char && mostRecentAutoClosingChar === undefined) {
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