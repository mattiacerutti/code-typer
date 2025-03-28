import {SHOULD_PRESERVE_CLOSING_CHAR_WHEN_DELETING} from "@/constants/constants";
import {ITextLine} from "@/types/text-line";
import {CharacterState, CharacterTypes, WhitespaceTypes} from "@/types/character";
import {IGameState} from "@/types/game-state";
import {getBindedClosingChar, getChar, hasOnlyWhitespacesBefore, isClosingCharacter, setCharacterState} from "./common";

export function deleteCharacter(
  gameState: IGameState,
  position: {lineIndex: number; charIndex: number},
  updateSnippetLines: (lines: ITextLine[]) => void,
  updateUserPosition: (position: {lineIndex?: number; charIndex?: number}) => void
) {
  if (position.charIndex > 0) {
    position.charIndex--;
  } else if (position.lineIndex !== 0) {
    position.lineIndex--;
    position.charIndex = gameState.snippet!.lines[position.lineIndex].text.length - 1;
  }

  const newChar = getChar(gameState, position);

  if (
    (newChar.type === CharacterTypes.Whitespace && hasOnlyWhitespacesBefore(gameState, position.charIndex, position.lineIndex)) ||
    (newChar.value == WhitespaceTypes.NewLine && position.charIndex == 0) ||
    (SHOULD_PRESERVE_CLOSING_CHAR_WHEN_DELETING && newChar.state === CharacterState.Right && isClosingCharacter(newChar))
  ) {
    deleteCharacter(gameState, position, updateSnippetLines, updateUserPosition);
    return;
  }

  const char = getChar(gameState, position);

  if (char.type === CharacterTypes.AutoClosing) {
    const closingParenthesis = getBindedClosingChar(gameState, char);
    if (closingParenthesis) {
      closingParenthesis.state = CharacterState.Default;
    } else {
      throw new Error("Couldn't find a closing parenthesis");
    }
  }

  setCharacterState(gameState, position, updateSnippetLines, CharacterState.Default);
  updateUserPosition(position);
}
