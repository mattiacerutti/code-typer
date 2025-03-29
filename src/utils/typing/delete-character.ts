import {SHOULD_PRESERVE_CLOSING_CHAR_WHEN_DELETING} from "@/constants/constants";
import {CharacterState, CharacterTypes, ICharacter} from "@/types/character";
import {IGameState} from "@/types/game-state";
import {getBindedClosingChar, getPreviousChar, hasOnlyWhitespacesBefore, isClosingCharacter, setCharacterState} from "./shared";

export function deleteCharacter(
  gameState: IGameState,
  updateParsedSnippet: (parsedSnippet: ICharacter[]) => void,
  updateUserPosition: (position: number) => void,
  position: number
) {
  if(position === 0) {
    return;
  }

  const newChar = getPreviousChar(gameState, position) as ICharacter;

  if (
    (newChar.type === CharacterTypes.Whitespace && hasOnlyWhitespacesBefore(gameState, position - 1)) ||
    //(newChar.value == WhitespaceTypes.NewLine && position.charIndex == 0) ||
    (SHOULD_PRESERVE_CLOSING_CHAR_WHEN_DELETING && newChar.state === CharacterState.Right && isClosingCharacter(newChar))
  ) {
    deleteCharacter(gameState, updateParsedSnippet, updateUserPosition, position - 1);
    return;
  }

  if (newChar.type === CharacterTypes.AutoClosing) {
    const bindedClosingChar = getBindedClosingChar(gameState, newChar);
    if (bindedClosingChar) {
      bindedClosingChar.state = CharacterState.Default;
    } else {
      throw new Error("Couldn't find a closing parenthesis");
    }
  }

  setCharacterState(gameState, position - 1, updateParsedSnippet, CharacterState.Default);
  updateUserPosition(position - 1);
}
