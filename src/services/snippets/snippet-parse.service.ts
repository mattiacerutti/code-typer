import {CharacterState, CharacterTypes, WhitespaceTypes} from "@/types/character";
import { IParsedSnippet } from "@/types/snippet";
import { AUTO_CLOSING_CHARS } from "@/constants/constants";
export const parseSnippet = (originalText: string): IParsedSnippet => {
  let mostRecentAutoClosingChar: string | undefined = undefined;

  const parsedText: IParsedSnippet = originalText.split("").map((char: string) => {
    if (Object.keys(AUTO_CLOSING_CHARS).includes(char)) {
      if (AUTO_CLOSING_CHARS[char] !== char && mostRecentAutoClosingChar === undefined) {
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

  parsedText.push({
    type: CharacterTypes.EOF,
    value: "EOF",
    state: CharacterState.Default,
  });

  return parsedText;
};
