import {SHOULD_PRESERVE_CLOSING_CHAR_WHEN_DELETING} from "@/constants/game";
import {CharacterState, CharacterTypes, ICharacter} from "@/types/character";
import {IParsedSnippet} from "@/types/snippet";
import {getPreviousChar, hasOnlyWhitespacesBefore, isClosingCharacter, resetCharactersInRange} from "@/lib/client/typing/shared";

function decrementUserPosition(snippet: IParsedSnippet, position: number): number {
  if (position === 0) return 0;
  const prevChar = getPreviousChar(snippet, position) as ICharacter;
  if (
    (prevChar.type === CharacterTypes.Whitespace && hasOnlyWhitespacesBefore(snippet, position - 1)) ||
    (SHOULD_PRESERVE_CLOSING_CHAR_WHEN_DELETING && prevChar.state === CharacterState.Right && isClosingCharacter(prevChar))
  ) {
    return decrementUserPosition(snippet, position - 1);
  }
  return position - 1;
}

export function deleteCharacter(
  snippet: IParsedSnippet,
  position: number,
  updateParsedSnippet: (parsedSnippet: IParsedSnippet) => void,
  updateUserPosition: (position: number) => void
) {
  if (position === 0) {
    return;
  }
  const newPos = decrementUserPosition(snippet, position);

  resetCharactersInRange(snippet, newPos, position);

  updateParsedSnippet(snippet);
  updateUserPosition(newPos);
}
