import {SHOULD_PRESERVE_CLOSING_CHAR_WHEN_DELETING} from "@/constants/game";
import {CharacterState, CharacterTypes, ICharacter} from "@/types/character";
import { IParsedSnippet } from "@/types/snippet";
import {getBindedClosingChar, getPreviousChar, hasOnlyWhitespacesBefore, isClosingCharacter, setCharacterState} from "@/lib/client/typing/shared";

export function deleteCharacter(
  snippet: IParsedSnippet,
  position: number,
  updateParsedSnippet: (parsedSnippet: IParsedSnippet) => void,
  updateUserPosition: (position: number) => void,
) {
  if(position === 0) {
    return;
  }

  const newChar = getPreviousChar(snippet, position) as ICharacter;

  if (
    (newChar.type === CharacterTypes.Whitespace && hasOnlyWhitespacesBefore(snippet, position - 1)) ||
    (SHOULD_PRESERVE_CLOSING_CHAR_WHEN_DELETING && newChar.state === CharacterState.Right && isClosingCharacter(newChar))
  ) {
    deleteCharacter(snippet, position - 1, updateParsedSnippet, updateUserPosition);
    return;
  }

  if (newChar.type === CharacterTypes.AutoClosing) {
    const bindedClosingChar = getBindedClosingChar(snippet, newChar, position - 1);
    if (bindedClosingChar) {
      bindedClosingChar.state = CharacterState.Default;
    } else {
      throw new Error("Couldn't find a closing parenthesis");
    }
  }

  setCharacterState(snippet, position - 1, updateParsedSnippet, CharacterState.Default);
  updateUserPosition(position - 1);
}

