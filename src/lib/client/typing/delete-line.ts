import {CharacterState} from "@/types/character";
import {getLineStart, getPreviousLineEnd, isFirstCharacter, resetCharactersInRange} from "@/lib/client/typing/shared";
import {IGameStatePlaying, IGameStateReady} from "@/types/game-state";
import {IParsedSnippet} from "@/types/snippet";

export function deleteLine(
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

  const firstLineCharacterIndex = getLineStart(snippet, position);
  if (firstLineCharacterIndex === undefined) {
    return;
  }

  resetCharactersInRange(snippet, firstLineCharacterIndex, position);

  updateParsedSnippet([...state.currentSnippet.parsedSnippet]);
  updateUserPosition(firstLineCharacterIndex);
}
