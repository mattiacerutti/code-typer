import {CharacterState, CharacterTypes, WhitespaceTypes, ICharacter} from "@/types/character";
import {getBindedClosingChar, getLineStart, isFirstCharacter} from "./shared";
import {IGameState} from "@/types/game-state";

function getPreviousLineEnd(gameState: IGameState, position: number): number | undefined {
  for (let i = position - 1; i >= 0; i--) {
    if (gameState.snippet!.parsedSnippet[i].value === WhitespaceTypes.NewLine) {
      return i;
    }
  }
  return undefined;
}

export function deleteLine(gameState: IGameState, updateParsedSnippet: (parsedSnippet: ICharacter[]) => void, updateUserPosition: (position: number) => void) {
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

  const firstLineCharacterIndex = getLineStart(gameState, position);
  if (firstLineCharacterIndex === undefined) {
    return;
  }

  for (let i = firstLineCharacterIndex; i <= position; i++) {
    gameState.snippet!.parsedSnippet[i].state = CharacterState.Default;
    if (gameState.snippet!.parsedSnippet[i].type === CharacterTypes.AutoClosing) {
      const bindedClosingChar = getBindedClosingChar(gameState, gameState.snippet!.parsedSnippet[i]);
      if (bindedClosingChar) {
        bindedClosingChar.state = CharacterState.Default;
      }
    }
  }

  updateParsedSnippet([...gameState.snippet!.parsedSnippet]);
  updateUserPosition(firstLineCharacterIndex);
}
