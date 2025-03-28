import {IGameState} from "@/types/game-state";
import {CharacterState, CharacterTypes, ICharacter, WhitespaceTypes} from "@/types/character";
import {ITextLine} from "@/types/text-line";
import { AUTO_CLOSING_CHARS } from "@/constants/constants";

export function getChar(gameState: IGameState, position: {lineIndex: number; charIndex: number}): ICharacter {
  return gameState.snippet!.lines[position.lineIndex].text[position.charIndex];
}

export function getPreviousChar(gameState: IGameState, userPosition: {lineIndex: number; charIndex: number}) {
  let prevChar;
  if (userPosition.charIndex === 0) {
    if (userPosition.lineIndex === 0) {
      return prevChar;
    }
    prevChar = getChar(gameState, {lineIndex: userPosition.lineIndex - 1, charIndex: gameState.snippet!.lines[userPosition.lineIndex - 1].text.length - 1});
    if (prevChar.value === WhitespaceTypes.Tab) {
      return getPreviousChar(gameState, {lineIndex: userPosition.lineIndex - 1, charIndex: gameState.snippet!.lines[userPosition.lineIndex - 1].text.length - 1});
    }
    return prevChar;
  }
  prevChar = getChar(gameState, {lineIndex: userPosition.lineIndex, charIndex: userPosition.charIndex - 1});
  if (prevChar.value === WhitespaceTypes.Tab) {
    return getPreviousChar(gameState, {lineIndex: userPosition.lineIndex, charIndex: userPosition.charIndex - 1});
  }
  return prevChar;
}

export function setCharacterState(
  gameState: IGameState,
  position: {lineIndex: number; charIndex: number},
  updateSnippetLines: (lines: ITextLine[]) => void,
  state: CharacterState
) {
  gameState.snippet!.lines[position.lineIndex].text[position.charIndex].state = state;
  updateSnippetLines([...gameState.snippet!.lines]);
}

export function getBindedClosingChar(gameState: IGameState, char: ICharacter) {
  let cont = 1;
  let startingChar = gameState.userPosition.charIndex + 1;

  for (let i = gameState.userPosition.lineIndex; i < gameState.snippet!.lines.length; i++) {
    for (let j = startingChar; j < gameState.snippet!.lines[i].text.length; j++) {
      const currentChar = gameState.snippet!.lines[i].text[j];
      if (currentChar.value === AUTO_CLOSING_CHARS[char.value]) {
        cont--;
        if (cont === 0) {
          return currentChar;
        }
      }
      if (currentChar.value === char.value) {
        cont++;
        continue;
      }
    }
    startingChar = 0;
  }
  return undefined;
}

export function hasOnlyWhitespacesBefore(gameState: IGameState, charIndex: number, lineIndex: number) {
  for (let i = charIndex - 1; i >= 0; i--) {
    if (getChar(gameState, {lineIndex, charIndex: i}).type !== CharacterTypes.Whitespace) {
      return false;
    }
  }
  return true;
}

export function isClosingCharacter(char: ICharacter): boolean {
  return Object.values(AUTO_CLOSING_CHARS).includes(char.value) && char.type === CharacterTypes.Normal;
}
