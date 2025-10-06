import {getChar, getPreviousChar, hasOnlyWhitespacesBefore, setCharacterState} from "@/features/game/logic/typing/shared";
import {CharacterState, CharacterTypes} from "@/shared/types/character";
import {IParsedSnippet} from "@/shared/types/snippet";

function incrementUserPosition(snippet: IParsedSnippet, position: number, updateUserPosition: (position: number) => void, isPressedKeyCorrect: boolean): number {
  const newChar = getChar(snippet, position + 1);

  if (
    (newChar.type === CharacterTypes.Whitespace && hasOnlyWhitespacesBefore(snippet, position + 1)) ||
    (newChar.type === CharacterTypes.AutoClosing && !newChar.isOpening && (isPressedKeyCorrect || snippet[newChar.pairedChar].state === CharacterState.Right))
  ) {
    return incrementUserPosition(snippet, position + 1, updateUserPosition, isPressedKeyCorrect);
  }

  return position + 1;
}

function getSignificantPreviousChar(snippet: IParsedSnippet, position: number): IParsedSnippet[number] | null {
  const prevChar = getPreviousChar(snippet, position);
  if (!prevChar) return null;

  if (prevChar.type === CharacterTypes.AutoClosing && !prevChar.isOpening) {
    return getSignificantPreviousChar(snippet, position - 1);
  }

  return prevChar;
}

export function addCharacter(
  snippet: IParsedSnippet,
  position: number,
  pressedKey: string,
  updateParsedSnippet: (parsedSnippet: IParsedSnippet) => void,
  updateUserPosition: (position: number) => void,
  registerKeyStroke: (isCorrect: boolean) => void
) {
  const expectedChar = getChar(snippet, position);

  if (expectedChar.value === "EOF") return;
;

  if (pressedKey === "Enter") {
    pressedKey = "\n";
  }
  let isPressedKeyCorrect = pressedKey === expectedChar.value;

    // If the previous character was incorrect, we also set this to incorrect no matter what.
  const prevChar = getSignificantPreviousChar(snippet, position)
  if (prevChar && prevChar.state === CharacterState.Wrong) {
    isPressedKeyCorrect = false;
  }

  const newPosition = incrementUserPosition(snippet, position, updateUserPosition, isPressedKeyCorrect);


  for (let i = position; i <= newPosition - 1; i++) {
    const char = snippet[i];
    if (char.type === CharacterTypes.AutoClosing && !char.isOpening && (isPressedKeyCorrect || snippet[char.pairedChar].state === CharacterState.Right)) {
      continue;
    }
    setCharacterState(snippet, i, isPressedKeyCorrect ? CharacterState.Right : CharacterState.Wrong);
  }

  registerKeyStroke(isPressedKeyCorrect);

  updateParsedSnippet(snippet);
  updateUserPosition(newPosition);
}
