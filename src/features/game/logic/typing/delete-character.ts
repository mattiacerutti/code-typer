import {CharacterState, CharacterTypes, WhitespaceTypes} from "@/features/shared/types/character";
import {IParsedSnippet} from "@/features/shared/types/snippet";
import {getChar, hasOnlyWhitespacesBefore, resetCharactersInRange} from "@/features/game/logic/typing/shared";
import {AutoClosingMode} from "@/features/settings/types/autoclosing-mode";

function decrementUserPosition(snippet: IParsedSnippet, position: number, autoClosingMode: AutoClosingMode): number {
  if (position === 0) return 0;
  const prevChar = getChar(snippet, position - 1);
  if (
    (prevChar.type === CharacterTypes.Whitespace &&
      hasOnlyWhitespacesBefore(snippet, position - 1) &&
      (autoClosingMode === AutoClosingMode.FULL || prevChar.value !== WhitespaceTypes.NewLine)) ||
    (autoClosingMode === AutoClosingMode.FULL && prevChar.type === CharacterTypes.AutoClosing && !prevChar.isOpening && prevChar.state === CharacterState.Right)
  ) {
    return decrementUserPosition(snippet, position - 1, autoClosingMode);
  }
  return position - 1;
}

export function deleteCharacter(snippet: IParsedSnippet, position: number, autoClosingMode: AutoClosingMode): [IParsedSnippet, number] {
  if (position === 0) return [snippet, 0];
  const newPos = decrementUserPosition(snippet, position, autoClosingMode);

  const updatedSnippet = resetCharactersInRange(snippet, newPos, position - 1, autoClosingMode === AutoClosingMode.FULL);

  return [updatedSnippet, newPos];
}
