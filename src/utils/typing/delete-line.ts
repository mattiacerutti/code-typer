import {CharacterState} from "@/types/character";
import {getLineStart, getPreviousLineEnd, isFirstCharacter, resetCharactersInRange} from "@/utils/typing/shared";
import {IGameState} from "@/types/game-state";
import { ISnippet } from "@/types/snippet";

export function deleteLine(state: IGameState, updateParsedSnippet: (parsedSnippet: ISnippet) => void, updateUserPosition: (position: number) => void) {
  const position = state.userPosition;
  const snippet = state.snippet!.parsedSnippet;
  if (position === 0) return;

  if (isFirstCharacter(snippet, position)) {
    let previousLineEnd = getPreviousLineEnd(snippet, position);
    if (previousLineEnd === undefined) {
      throw new Error("Couldn't find a previous line. This error should never happen.");
    }

    while (previousLineEnd! > 0 && getLineStart(snippet, previousLineEnd!) === undefined) {
      previousLineEnd = getPreviousLineEnd(snippet, previousLineEnd!);
    }

    state.snippet!.parsedSnippet[previousLineEnd!].state = CharacterState.Default;
    updateParsedSnippet([...state.snippet!.parsedSnippet]);
    updateUserPosition(previousLineEnd!);
    return;
  }

  const firstLineCharacterIndex = getLineStart(snippet, position);
  if (firstLineCharacterIndex === undefined) {
    return;
  }

  resetCharactersInRange(snippet, firstLineCharacterIndex, position);

  updateParsedSnippet([...state.snippet!.parsedSnippet]);
  updateUserPosition(firstLineCharacterIndex);
}
