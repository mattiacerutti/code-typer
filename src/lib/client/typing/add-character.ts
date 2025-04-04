import {IGameStatePlaying, IGameStateReady} from "@/types/game-state";
import {getBindedClosingChar, getChar, getPreviousChar, hasOnlyWhitespacesBefore} from "@/lib/client/typing/shared";
import {CharacterState, CharacterTypes, ICharacter} from "@/types/character";
import {IParsedSnippet} from "@/types/snippet";

function handleAutoClosingCharacter(snippet: IParsedSnippet, position: number, char: ICharacter) {
  const closingCharacter = getBindedClosingChar(snippet, char, position);
  if (closingCharacter) {
    closingCharacter.state = CharacterState.Right;
    return;
  }
  throw new Error("Couldn't find a closing parenthesis");
}

function incrementUserPosition(snippet: IParsedSnippet, position: number, updateUserPosition: (position: number) => void): number {
  const newChar = getChar(snippet, position + 1);

  if ((newChar.type === CharacterTypes.Whitespace && hasOnlyWhitespacesBefore(snippet, position + 1)) || newChar.state === CharacterState.Right) {
    return incrementUserPosition(snippet, position + 1, updateUserPosition);
  }

  return position + 1;
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

  if (isPressedKeyCorrect && expectedChar.type === CharacterTypes.AutoClosing) {
    handleAutoClosingCharacter(snippet, position, expectedChar);
  }

  // Increments the user position
  const newPosition = incrementUserPosition(snippet, position, updateUserPosition);

  // If the previous character was incorrect, we also set this to incorrect no matter what.
  const prevChar = getPreviousChar(snippet, position);
  if (prevChar && prevChar.state === CharacterState.Wrong) {
    isPressedKeyCorrect = false;
  }

  for (let i = position; i <= newPosition - 1; i++) {
    snippet[i].state = isPressedKeyCorrect ? CharacterState.Right : CharacterState.Wrong;
  }

  // Registers correct/incorrect key press for stats purposes
  registerKeyStroke(isPressedKeyCorrect);

  updateParsedSnippet(snippet);
  updateUserPosition(newPosition);

  return;
}
