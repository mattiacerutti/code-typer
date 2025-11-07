import {CharacterState, CharacterTypes, ICharacter} from "@/shared/types/character";
import {IParsedSnippet} from "@/shared/types/snippet";
import {getPreviousChar, hasOnlyWhitespacesBefore, resetCharactersInRange} from "@/features/game/logic/typing/shared";

function decrementUserPosition(snippet: IParsedSnippet, position: number): number {
  if (position === 0) return 0;
  const prevChar = getPreviousChar(snippet, position) as ICharacter;
  if (
    (prevChar.type === CharacterTypes.Whitespace && hasOnlyWhitespacesBefore(snippet, position - 1)) ||
    (prevChar.type === CharacterTypes.AutoClosing && !prevChar.isOpening && prevChar.state === CharacterState.Right)
  ) {
    return decrementUserPosition(snippet, position - 1);
  }
  return position - 1;
}

export function deleteCharacter(snippet: IParsedSnippet, position: number): [IParsedSnippet, number] {
  if (position === 0) return [snippet, 0];
  const newPos = decrementUserPosition(snippet, position);

  resetCharactersInRange(snippet, newPos, position);

  return [snippet, newPos];
}
