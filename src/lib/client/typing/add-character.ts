import {IGameStatePlaying, IGameStateReady} from "@/types/game-state";
import {getBindedClosingChar, getChar, getPreviousChar, hasOnlyWhitespacesBefore, setCharacterState} from "@/lib/client/typing/shared";
import {CharacterState, CharacterTypes, ICharacter} from "@/types/character";
import { IParsedSnippet } from "@/types/snippet";

function handleAutoClosingCharacter(snippet: IParsedSnippet, position: number, char: ICharacter) {
  const closingCharacter = getBindedClosingChar(snippet, char, position);
  if (closingCharacter) {
    closingCharacter.state = CharacterState.Right;
    return;
  }
  throw new Error("Couldn't find a closing parenthesis");
}

function incrementCursor(snippet: IParsedSnippet, position: number, updateUserPosition: (position: number) => void) {


  const newChar = getChar(snippet, position + 1);

  if (
    (newChar.type === CharacterTypes.Whitespace && hasOnlyWhitespacesBefore(snippet, position + 1)) ||
    newChar.state === CharacterState.Right
  ) {
    incrementCursor(snippet, position + 1, updateUserPosition);
    return;
  }

  updateUserPosition(position + 1);
}

export function addCharacter(
  state: IGameStatePlaying | IGameStateReady,
  pressedKey: string,
  updateParsedSnippet: (parsedSnippet: IParsedSnippet) => void,
  updateUserPosition: (position: number) => void,
  registerKeyStroke: (isCorrect: boolean) => void
) {

  const position = state.userPosition;
  const snippet = state.currentSnippet.parsedSnippet;

  const expectedChar = getChar(snippet, position);

  if (expectedChar.value === "EOF") return;

  if (pressedKey === "Enter") {
    pressedKey = "\n";
  }
  let isPressedKeyCorrect = pressedKey === expectedChar.value;

  // If the previous character was incorrect, we also set this to incorrect no matter what.
  const prevChar = getPreviousChar(snippet, position);
  if (prevChar && prevChar.state === CharacterState.Wrong) {
    isPressedKeyCorrect = false;
  }

  if (isPressedKeyCorrect && expectedChar.type === CharacterTypes.AutoClosing) {
    handleAutoClosingCharacter(snippet, position, expectedChar);
  }

  registerKeyStroke(isPressedKeyCorrect);

  setCharacterState(snippet, position, updateParsedSnippet, isPressedKeyCorrect ? CharacterState.Right : CharacterState.Wrong);
  incrementCursor(snippet, position, updateUserPosition);

  return;
}
