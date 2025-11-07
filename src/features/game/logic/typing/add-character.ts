import {getChar, getPreviousChar, hasOnlyWhitespacesBefore, setCharacterState} from "@/features/game/logic/typing/shared";
import {AutoClosingMode} from "@/features/settings/types/autoclosing-mode";
import {CharacterState, CharacterTypes} from "@/shared/types/character";
import {IParsedSnippet} from "@/shared/types/snippet";

function incrementUserPosition(snippet: IParsedSnippet, position: number, isPressedKeyCorrect: boolean, autoClosingMode: AutoClosingMode): number {
  const newChar = getChar(snippet, position + 1);

  if (
    (newChar.type === CharacterTypes.Whitespace && hasOnlyWhitespacesBefore(snippet, position + 1)) ||
    (autoClosingMode === AutoClosingMode.FULL &&
      newChar.type === CharacterTypes.AutoClosing &&
      !newChar.isOpening &&
      (isPressedKeyCorrect || snippet[newChar.pairedChar].state === CharacterState.Right))
  ) {
    return incrementUserPosition(snippet, position + 1, isPressedKeyCorrect, autoClosingMode);
  }

  return position + 1;
}

function getSignificantPreviousChar(snippet: IParsedSnippet, position: number, autoClosingMode: AutoClosingMode): IParsedSnippet[number] | null {
  const prevChar = getPreviousChar(snippet, position);
  if (!prevChar) return null;

  if (autoClosingMode === AutoClosingMode.FULL && prevChar.type === CharacterTypes.AutoClosing && !prevChar.isOpening) {
    return getSignificantPreviousChar(snippet, position - 1, autoClosingMode);
  }

  return prevChar;
}

export function addCharacter(
  snippet: IParsedSnippet,
  position: number,
  pressedKey: string,
  registerKeyStroke: (isCorrect: boolean) => void,
  autoClosingMode: AutoClosingMode
): [IParsedSnippet, number] {
  const expectedChar = getChar(snippet, position);
  if (expectedChar.value === "EOF") return [snippet, position];

  if (pressedKey === "Enter") {
    pressedKey = "\n";
  }

  let isPressedKeyCorrect = pressedKey === expectedChar.value;

  // Lets the user skip over auto-closing characters with the arrow when Auto-Closing Mode is set to Partial.
  if (pressedKey === "ArrowRight") {
    if (autoClosingMode !== AutoClosingMode.PARTIAL || expectedChar.type !== CharacterTypes.AutoClosing || expectedChar.isOpening || expectedChar.state !== CharacterState.Right) {
      return [snippet, position];
    }
    isPressedKeyCorrect = true;
  }

  // If the previous character was incorrect, we also set this to incorrect no matter what.
  const prevChar = getSignificantPreviousChar(snippet, position, autoClosingMode);
  if (prevChar && prevChar.state === CharacterState.Wrong) {
    isPressedKeyCorrect = false;
  }

  const newPosition = incrementUserPosition(snippet, position, isPressedKeyCorrect, autoClosingMode);

  for (let i = position; i <= newPosition - 1; i++) {
    const char = snippet[i];
    if (
      autoClosingMode === AutoClosingMode.FULL &&
      char.type === CharacterTypes.AutoClosing &&
      !char.isOpening &&
      (isPressedKeyCorrect || snippet[char.pairedChar].state === CharacterState.Right)
    ) {
      continue;
    }
    setCharacterState(snippet, i, isPressedKeyCorrect ? CharacterState.Right : CharacterState.Wrong);
  }

  registerKeyStroke(isPressedKeyCorrect);

  return [snippet, newPosition];
}
