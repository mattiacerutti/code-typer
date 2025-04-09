import {CharacterState, CharacterTypes, WhitespaceTypes} from "@/types/character";
import {IParsedSnippet} from "@/types/snippet";
import {AUTO_CLOSING_CHARS} from "@/constants/game";
import {ISnippet} from "@/types/server/snippet";

function createAutoClosingMaps(snippet: ISnippet): {autoClosingMap: Record<number, number>; reverseAutoClosingMap: Record<number, number>} {
  const pendingPairs: Record<string, number[]> = {};

  const autoClosingMap: Record<number, number> = {};
  const reverseAutoClosingMap: Record<number, number> = {};

  // Helper functions for clarity
  const isOpeningChar = (char: string): boolean => Object.keys(AUTO_CLOSING_CHARS).includes(char);
  const isClosingChar = (char: string): boolean => Object.values(AUTO_CLOSING_CHARS).includes(char);
  const isStringDelimiter = (char: string): boolean => AUTO_CLOSING_CHARS[char] === char;

  for (let i = 0; i < snippet.content.length; i++) {
    const char = snippet.content[i];

    // If we're inside a disabled range, skip
    if (snippet.disabledRanges.some((range) => range.startIndex <= i && range.endIndex >= i)) {
      continue;
    }

    if (isStringDelimiter(char)) {
      // Since string delimiters cannot "stack", if we already have one in the queue the current one is a closure character.
      if (pendingPairs[char] && pendingPairs[char].length > 0) {
        const lastIndex = pendingPairs[char].pop() as number;
        autoClosingMap[lastIndex] = i;
        reverseAutoClosingMap[i] = lastIndex;
      } else {
        pendingPairs[char] = pendingPairs[char] || [];
        pendingPairs[char].push(i);
      }
    } else if (isOpeningChar(char)) {
      // For opening characters, push the index onto the stack for its expected closing character
      const expectedClosingChar = AUTO_CLOSING_CHARS[char];
      pendingPairs[expectedClosingChar] = pendingPairs[expectedClosingChar] || [];
      pendingPairs[expectedClosingChar].push(i);
    } else if (isClosingChar(char)) {
      // For non-string closing characters, retrieve the corresponding opening index
      const openingIndex = pendingPairs[char]?.pop();
      if (openingIndex === undefined) {
        throw new Error(`No opening pair char found for ${char}`);
      }
      autoClosingMap[openingIndex] = i;
      reverseAutoClosingMap[i] = openingIndex;
    }
  }

  return {autoClosingMap, reverseAutoClosingMap};
}

export const parseSnippet = (snippet: ISnippet): IParsedSnippet | null => {
  const characters: string[] = snippet.content.split("");

  let autoClosingMap: Record<number, number> = {};
  let reverseAutoClosingMap: Record<number, number> = {};
  try {
    ({autoClosingMap, reverseAutoClosingMap} = createAutoClosingMaps(snippet));
  } catch (error) {
    console.warn("Error creating auto closing maps", error, "Snippet: ", snippet.content);
    return null;
  }

  const parsedText: IParsedSnippet = characters.map((char: string, index: number) => {
    if (autoClosingMap[index] !== undefined) {
      return {
        type: CharacterTypes.AutoClosing,
        value: char,
        state: CharacterState.Default,
        isOpening: true,
        pairedChar: autoClosingMap[index],
      };
    }

    if (reverseAutoClosingMap[index] !== undefined) {
      return {
        type: CharacterTypes.AutoClosing,
        value: char,
        state: CharacterState.Default,
        isOpening: false,
        pairedChar: reverseAutoClosingMap[index],
      };
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

  console.log("Parsed text", parsedText);

  return parsedText;
};
