import {IGameState} from "@/types/game-state";
import {CharacterState, CharacterTypes, ICharacter, WhitespaceTypes} from "@/types/character";
import {AUTO_CLOSING_CHARS} from "@/constants/constants";

export function getChar(gameState: IGameState, position: number): ICharacter {
  return gameState.snippet!.parsedSnippet[position];
}

export function getPreviousChar(gameState: IGameState, position: number) {
  if (position === 0) {
    return undefined;
  }
  const prevChar = getChar(gameState, position - 1);
  if (prevChar.value === WhitespaceTypes.Tab) {
    return getPreviousChar(gameState, position - 1);
  }
  return prevChar;
}

export function getLineStart(gameState: IGameState, position: number): number | undefined {
  let nonWhitespaceChar = undefined;
  for (let i = position; i >= 0; i--) {
    const char = getChar(gameState, i);
    if (char.value === WhitespaceTypes.NewLine && i !== position) {
      break;
    }
    if (char.value !== WhitespaceTypes.Tab && char.value !== WhitespaceTypes.NewLine) {
      nonWhitespaceChar = i;
    }
  }
  return nonWhitespaceChar;
}

export function setCharacterState(gameState: IGameState, position: number, updateParsedSnippet: (parsedSnippet: ICharacter[]) => void, state: CharacterState) {
  gameState.snippet!.parsedSnippet[position].state = state;
  updateParsedSnippet([...gameState.snippet!.parsedSnippet]);
}

export function getBindedClosingChar(gameState: IGameState, char: ICharacter) {
  let cont = 1;

  for (let i = gameState.userPosition + 1; i < gameState.snippet!.parsedSnippet.length; i++) {
    const currentChar = gameState.snippet!.parsedSnippet[i];
    if (currentChar.value === AUTO_CLOSING_CHARS[char.value]) {
      cont--;
      if (cont === 0) {
        return currentChar;
      }
    }
    if (currentChar.value === char.value) {
      cont++;
    }
  }
  return undefined;
}

export function hasOnlyWhitespacesBefore(gameState: IGameState, position: number): boolean {
  let prevChar = getPreviousChar(gameState, position);
  while (prevChar && prevChar.value !== WhitespaceTypes.NewLine) {
    if (prevChar.type !== CharacterTypes.Whitespace) {
      return false;
    }
    position--;
    prevChar = getPreviousChar(gameState, position);
  }
  return true;
}

export function isClosingCharacter(char: ICharacter): boolean {
  return Object.values(AUTO_CLOSING_CHARS).includes(char.value) && char.type === CharacterTypes.Normal;
}

export function isFirstCharacter(gameState: IGameState, position: number): boolean {
  const prevChar = getPreviousChar(gameState, position);
  return prevChar === undefined || (prevChar.type === CharacterTypes.Whitespace && prevChar.value === WhitespaceTypes.NewLine) || hasOnlyWhitespacesBefore(gameState, position);
}
