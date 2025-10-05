import {CharacterTypes, ICharacter, WhitespaceTypes} from "@/shared/types/character";
import {getLineStart, getPreviousChar, getPreviousLineEnd, isFirstCharacter, resetCharactersInRange} from "@/features/game/logic/typing/shared";
import {IGameStatePlaying, IGameStateReady} from "@/features/game/types/game-state";
import {AUTO_CLOSING_CHARS} from "@/features/game/config/game";
import {IParsedSnippet} from "@/shared/types/snippet";

const isWordSeparator = (char: ICharacter) =>
  char.value === "." ||
  char.value === "," ||
  char.value === ";" ||
  char.value === ":" ||
  char.value === "!" ||
  char.value === "?" ||
  (Object.values(AUTO_CLOSING_CHARS).includes(char.value) && char.type !== CharacterTypes.AutoClosing) ||
  Object.keys(AUTO_CLOSING_CHARS).includes(char.value);

function getPreviousWordPosition(snippet: IParsedSnippet, position: number): number {
  let currentChar = getPreviousChar(snippet, position);
  const previousChar = getPreviousChar(snippet, position - 1);

  if (!currentChar || !previousChar) {
    return 0;
  }

  if (currentChar.value === WhitespaceTypes.Space && previousChar.value === WhitespaceTypes.Space) {
    while (currentChar && currentChar.value === WhitespaceTypes.Space) {
      position--;
      currentChar = getPreviousChar(snippet, position);
    }
    return position;
  }

  if (isWordSeparator(currentChar)) {
    return position - 1;
  }

  do {
    position--;
    currentChar = getPreviousChar(snippet, position);
  } while (currentChar && currentChar.type !== CharacterTypes.Whitespace && !isWordSeparator(currentChar));

  return position;
}

export function deleteWord(
  state: IGameStatePlaying | IGameStateReady,
  updateParsedSnippet: (parsedSnippet: IParsedSnippet) => void,
  updateUserPosition: (position: number) => void
) {
  const position = state.userPosition;
  const snippet = state.currentSnippet.parsedSnippet;

  if (position === 0) return;

  let previousWordPosition = getPreviousWordPosition(snippet, position);

  if (isFirstCharacter(snippet, position)) {
    let previousLineEnd = getPreviousLineEnd(snippet, position);

    while (previousLineEnd && getLineStart(snippet, previousLineEnd) === previousLineEnd) {
      previousLineEnd = getPreviousLineEnd(snippet, previousLineEnd);
    }

    if (!previousLineEnd) {
      throw new Error("Couldn't find a previous line. This error should never happen.");
    }

    previousWordPosition = previousLineEnd;
  }

  resetCharactersInRange(snippet, previousWordPosition, position);

  updateParsedSnippet(snippet);
  updateUserPosition(previousWordPosition);
}
