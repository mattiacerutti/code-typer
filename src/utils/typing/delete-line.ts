import {CharacterState, ICharacter} from "@/types/character";
import {getLineStart, getPreviousLineEnd, isFirstCharacter, resetCharactersInRange} from "@/utils/typing/shared";
import {IGameState} from "@/types/game-state";

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

  resetCharactersInRange(gameState.snippet!.parsedSnippet, firstLineCharacterIndex, position);

  updateParsedSnippet([...gameState.snippet!.parsedSnippet]);
  updateUserPosition(firstLineCharacterIndex);
}
