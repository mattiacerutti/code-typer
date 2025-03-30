import {IGameState} from "@/types/game-state";
import {getBindedClosingChar, getChar, getPreviousChar, hasOnlyWhitespacesBefore, setCharacterState} from "@/utils/typing/shared";
import {CharacterState, CharacterTypes, ICharacter} from "@/types/character";

function handleAutoClosingCharacter(gameState: IGameState, char: ICharacter) {
  const closingCharacter = getBindedClosingChar(gameState.snippet!.parsedSnippet, char, gameState.userPosition);
  if (closingCharacter) {
    closingCharacter.state = CharacterState.Right;
    return;
  }
  throw new Error("Couldn't find a closing parenthesis");
}

function incrementCursor(gameState: IGameState, position: number, updateUserPosition: (position: number) => void) {


  const newChar = getChar(gameState, position + 1);

  if (
    (newChar.type === CharacterTypes.Whitespace && hasOnlyWhitespacesBefore(gameState, position + 1)) ||
    newChar.state === CharacterState.Right
  ) {
    incrementCursor(gameState, position + 1, updateUserPosition);
    return;
  }

  updateUserPosition(position + 1);
}

export function addCharacter(
  pressedKey: string,
  gameState: IGameState,
  updateParsedSnippet: (parsedSnippet: ICharacter[]) => void,
  updateUserPosition: (position: number) => void,
  registerKeyStroke: (isCorrect: boolean) => void
) {
  const expectedChar = getChar(gameState, gameState.userPosition);

  if (expectedChar.value === "EOF") return;

  if (pressedKey === "Enter") {
    pressedKey = "\n";
  }
  let isPressedKeyCorrect = pressedKey === expectedChar.value;

  // If the previous character was incorrect, we also set this to incorrect no matter what.
  const prevChar = getPreviousChar(gameState, gameState.userPosition);
  if (prevChar && prevChar.state === CharacterState.Wrong) {
    isPressedKeyCorrect = false;
  }

  if (isPressedKeyCorrect && expectedChar.type === CharacterTypes.AutoClosing) {
    handleAutoClosingCharacter(gameState, expectedChar);
  }

  registerKeyStroke(isPressedKeyCorrect);

  setCharacterState(gameState, gameState.userPosition, updateParsedSnippet, isPressedKeyCorrect ? CharacterState.Right : CharacterState.Wrong);
  incrementCursor(gameState, gameState.userPosition, updateUserPosition);

  return;
}
