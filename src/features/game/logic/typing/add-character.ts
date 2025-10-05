import {IGameStatePlaying, IGameStateReady} from "@/features/game/types/game-state";
import {getChar, getPreviousChar, hasOnlyWhitespacesBefore, setCharacterState} from "@/features/game/logic/typing/shared";
import {CharacterState, CharacterTypes} from "@/shared/types/character";
import {IParsedSnippet} from "@/shared/types/snippet";

function incrementUserPosition(snippet: IParsedSnippet, position: number, updateUserPosition: (position: number) => void): number {
  const newChar = getChar(snippet, position + 1);

  if ((newChar.type === CharacterTypes.Whitespace && hasOnlyWhitespacesBefore(snippet, position + 1)) || (newChar.type === CharacterTypes.AutoClosing && !newChar.isOpening)) {
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

  // Increments the user position
  const newPosition = incrementUserPosition(snippet, position, updateUserPosition);

  // If the previous character was incorrect, we also set this to incorrect no matter what.
  const prevChar = getPreviousChar(snippet, position);
  if (prevChar && prevChar.state === CharacterState.Wrong) {
    isPressedKeyCorrect = false;
  }

  for (let i = position; i <= newPosition - 1; i++) {
    const char = snippet[i];
    if (char.type === CharacterTypes.AutoClosing && !char.isOpening && (isPressedKeyCorrect || snippet[char.pairedChar].state === CharacterState.Right)) {
      continue;
    }
    setCharacterState(snippet, i, isPressedKeyCorrect ? CharacterState.Right : CharacterState.Wrong);
  }

  // Registers correct/incorrect key press for stats purposes
  registerKeyStroke(isPressedKeyCorrect);

  updateParsedSnippet(snippet);
  updateUserPosition(newPosition);

  return;
}
