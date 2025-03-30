import {CharacterState, ICharacter, WhitespaceTypes} from "@/types/character";
import {getLineStart, getPreviousChar, getPreviousLineEnd, isFirstCharacter, resetCharactersInRange} from "./shared";
import {IGameState} from "@/types/game-state";
import {AUTO_CLOSING_CHARS} from "@/constants/constants";

const isWordSeparator = (char: ICharacter) =>
  char.value === "." ||
  char.value === "," ||
  char.value === ";" ||
  char.value === ":" ||
  char.value === "!" ||
  char.value === "?" ||
  Object.values(AUTO_CLOSING_CHARS).includes(char.value);

function getPreviousWordPosition(gameState: IGameState, position: number): number {
  let currentChar = getPreviousChar(gameState, position);
  const previousChar = getPreviousChar(gameState, position - 1);

  if (!currentChar || !previousChar) {
    return 0;
  }

  if (currentChar.value === WhitespaceTypes.Space && previousChar.value === WhitespaceTypes.Space) {
    while (currentChar && currentChar.value === WhitespaceTypes.Space) {
      position--;
      currentChar = getPreviousChar(gameState, position);
    }
    return position;
  }

  if (isWordSeparator(currentChar)) {
    return position - 1;
  }

  do {
    position--;
    currentChar = getPreviousChar(gameState, position);
  } while (currentChar && currentChar.value !== WhitespaceTypes.Space && !isWordSeparator(currentChar));

  return position;
}

export function deleteWord(gameState: IGameState, updateParsedSnippet: (parsedSnippet: ICharacter[]) => void, updateUserPosition: (position: number) => void) {
  const position = gameState.userPosition;
  if (position === 0) return;

  if (isFirstCharacter(gameState, position)) {
    let previousLineEnd = getPreviousLineEnd(gameState, position);
    if (previousLineEnd === undefined) {
      throw new Error("Couldn't find a previous line. This error should never happen.");
    }

    while (previousLineEnd! > 0 && getLineStart(gameState, previousLineEnd!) === undefined) {
      previousLineEnd = getPreviousLineEnd(gameState, previousLineEnd!);
    }

    gameState.snippet!.parsedSnippet[previousLineEnd!].state = CharacterState.Default;
    updateParsedSnippet([...gameState.snippet!.parsedSnippet]);
    updateUserPosition(previousLineEnd!);
    return;
  }

  const previousWordPosition = getPreviousWordPosition(gameState, position);
  resetCharactersInRange(gameState.snippet!.parsedSnippet, previousWordPosition, position);

  updateParsedSnippet([...gameState.snippet!.parsedSnippet]);
  updateUserPosition(previousWordPosition);
}
