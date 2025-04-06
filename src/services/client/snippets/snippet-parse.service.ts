import {CharacterState, CharacterTypes, WhitespaceTypes} from "@/types/character";
import {IParsedSnippet} from "@/types/snippet";
import {AUTO_CLOSING_CHARS} from "@/constants/game";

function createAutoClosingMaps(originalText: string): {autoClosingMap: Record<number, number>; reverseAutoClosingMap: Record<number, number>} {
  const pendingPairs: Record<string, number[]> = {};

  const autoClosingMap: Record<number, number> = {};
  const reverseAutoClosingMap: Record<number, number> = {};

  let currentStringOpener: string | null = null;

  // Helper functions for clarity
  const isStringIdentifier = (char: string): boolean => AUTO_CLOSING_CHARS[char] === char;
  const isOpeningChar = (char: string): boolean => Object.keys(AUTO_CLOSING_CHARS).includes(char);
  const isClosingChar = (char: string): boolean => Object.values(AUTO_CLOSING_CHARS).includes(char);

  for (let i = 0; i < originalText.length; i++) {
    const char = originalText[i];

    // If we're inside a string literal, only process the matching closing character
    if (currentStringOpener && char !== currentStringOpener) {
      continue;
    }

    if (isStringIdentifier(char)) {
      // Toggle string context: if not in a string, start one; if matching, end it
      if (!currentStringOpener) {
        currentStringOpener = char;
      } else if (currentStringOpener === char) {
        currentStringOpener = null;
      }

      // Attempt to pair the string delimiter
      const openingIndex = pendingPairs[char]?.pop();

      if (openingIndex === undefined) {
        // No previous opening found; record this index for pairing when the closing delimiter is found
        pendingPairs[char] = pendingPairs[char] || [];
        pendingPairs[char].push(i);
      } else {
        // Found a matching opening; record the pairing
        autoClosingMap[openingIndex] = i;
        reverseAutoClosingMap[i] = openingIndex;
      }
    } else if (isClosingChar(char)) {
      // For non-string closing characters, retrieve the corresponding opening index
      const openingIndex = pendingPairs[char]?.pop();
      if (openingIndex === undefined) {
        throw new Error(`No opening pair char found for ${char}`);
      }
      autoClosingMap[openingIndex] = i;
      reverseAutoClosingMap[i] = openingIndex;
    } else if (isOpeningChar(char)) {
      // For opening characters, push the index onto the stack for its expected closing character
      const expectedClosingChar = AUTO_CLOSING_CHARS[char];
      pendingPairs[expectedClosingChar] = pendingPairs[expectedClosingChar] || [];
      pendingPairs[expectedClosingChar].push(i);
    } else {
      // Other characters are ignored
      continue;
    }
  }

  return {autoClosingMap, reverseAutoClosingMap};
}

export const parseSnippet = (originalText: string): IParsedSnippet => {
  const characters: string[] = originalText.split("");
  const {autoClosingMap, reverseAutoClosingMap} = createAutoClosingMaps(originalText);

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

  console.log("parsedText", parsedText);

  return parsedText;
};
