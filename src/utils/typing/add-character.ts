import {IGameState} from "@/types/game-state";
import {ITextLine} from "@/types/text-line";
import {getBindedClosingChar, getChar, getPreviousChar, hasOnlyWhitespacesBefore, setCharacterState} from "./common";
import {CharacterState, CharacterTypes, ICharacter, WhitespaceTypes} from "@/types/character";

function handleAutoClosingCharacter(gameState: IGameState, char: ICharacter) {
  const closingCharacter = getBindedClosingChar(gameState, char);
  if (closingCharacter) {
    closingCharacter.state = CharacterState.Right;
    return;
  }
  throw new Error("Couldn't find a closing parenthesis");
}

function incrementCursor(gameState: IGameState, position: {charIndex: number; lineIndex: number}, updateUserPosition: (position: {lineIndex?: number; charIndex?: number}) => void) {
  let newCharIndex = position.charIndex;
  let newLineIndex = position.lineIndex;

  if (newCharIndex < gameState.snippet!.lines[newLineIndex].text.length - 1) {
    newCharIndex++;
  } else if (newLineIndex !== gameState.snippet!.lines.length - 1) {
    newCharIndex = 0;
    newLineIndex++;
  }

  const oldChar = getChar(gameState, position);
  const newChar = getChar(gameState, {lineIndex: newLineIndex, charIndex: newCharIndex});

  if (
    (newChar.type === CharacterTypes.Whitespace && hasOnlyWhitespacesBefore(gameState, newCharIndex, newLineIndex)) ||
    (oldChar.value == WhitespaceTypes.NewLine && newChar.value == WhitespaceTypes.NewLine) ||
    newChar.state === CharacterState.Right
  ) {
    incrementCursor(gameState, {charIndex: newCharIndex, lineIndex: newLineIndex}, updateUserPosition);
    return;
  }

  updateUserPosition({charIndex: newCharIndex, lineIndex: newLineIndex});
}

export function addCharacter(
  pressedKey: string,
  gameState: IGameState,
  updateSnippetLines: (lines: ITextLine[]) => void,
  updateUserPosition: (position: {lineIndex?: number; charIndex?: number}) => void,
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

  setCharacterState(gameState, gameState.userPosition, updateSnippetLines, isPressedKeyCorrect ? CharacterState.Right : CharacterState.Wrong);
  incrementCursor(gameState, gameState.userPosition, updateUserPosition);

  return;
}
