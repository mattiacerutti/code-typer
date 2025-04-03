import {CharacterState, ICharacter, WhitespaceTypes} from "@/types/character";
import {getLineStart, getPreviousChar, getPreviousLineEnd, isFirstCharacter, resetCharactersInRange} from "@/utils/typing/shared";
import {IGameStatePlaying, IGameStateReady} from "@/types/game-state";
import {AUTO_CLOSING_CHARS} from "@/constants/constants";
import {IParsedSnippet} from "@/types/snippet";

const isWordSeparator = (char: ICharacter) =>
  char.value === "." ||
  char.value === "," ||
  char.value === ";" ||
  char.value === ":" ||
  char.value === "!" ||
  char.value === "?" ||
  Object.values(AUTO_CLOSING_CHARS).includes(char.value) ||
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
  } while (currentChar && currentChar.value !== WhitespaceTypes.Space && !isWordSeparator(currentChar));

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

  if (isFirstCharacter(snippet, position)) {
    let previousLineEnd = getPreviousLineEnd(snippet, position);
    if (previousLineEnd === undefined) {
      throw new Error("Couldn't find a previous line. This error should never happen.");
    }

    while (previousLineEnd! > 0 && getLineStart(snippet, previousLineEnd!) === undefined) {
      previousLineEnd = getPreviousLineEnd(snippet, previousLineEnd!);
    }

    state.currentSnippet.parsedSnippet[previousLineEnd!].state = CharacterState.Default;
    updateParsedSnippet([...state.currentSnippet.parsedSnippet]);
    updateUserPosition(previousLineEnd!);
    return;
  }

  const previousWordPosition = getPreviousWordPosition(snippet, position);
  resetCharactersInRange(snippet, previousWordPosition, position);

  updateParsedSnippet(snippet);
  updateUserPosition(previousWordPosition);
}
