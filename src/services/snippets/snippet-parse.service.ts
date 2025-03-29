import {ICharacter, CharacterState, CharacterTypes, WhitespaceTypes} from "@/types/character";

export const parseSnippet = (originalText: string, autoClosingChars: {[key: string]: string}): ICharacter[] => {
  let mostRecentAutoClosingChar: string | undefined = undefined;

  const parsedText: ICharacter[] = originalText.split("").map((char: string) => {
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

  parsedText.push({
    type: CharacterTypes.EOF,
    value: "EOF",
    state: CharacterState.Default,
  });

  return parsedText;
};
