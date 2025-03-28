import {CharacterState, CharacterTypes} from "@/types/character";
import {isFirstCharacter} from "./shared";
import {ITextLine} from "@/types/text-line";
import {IGameState} from "@/types/game-state";

function getPreviousWordPosition(gameState: IGameState, position: {charIndex: number; lineIndex: number}): {charIndex: number; lineIndex: number; skippedChars?: number} {
  let {charIndex} = position;
  const {lineIndex} = position;

  const text = gameState.snippet!.lines[lineIndex].text;

  if (charIndex === 0) return {...position, skippedChars: 0};

  let skippedChars = 0;
  // Skip over the previous whitespace
  while (charIndex > 0 && text[charIndex - 1].type === CharacterTypes.Whitespace) {
    charIndex--;
    skippedChars++;
  }

  if (skippedChars > 0) return {charIndex, lineIndex, skippedChars};

  // Skip over the previous word
  while (charIndex > 0 && text[charIndex - 1].type !== CharacterTypes.Whitespace) {
    charIndex--;
  }

  return {charIndex, lineIndex};
}

export function deleteWord(
  gameState: IGameState,
  updateSnippetLines: (lines: ITextLine[]) => void,
  updateUserPosition: (position: {lineIndex?: number; charIndex?: number}) => void
) {
  if (isFirstCharacter(gameState, gameState.userPosition)) {
    if (gameState.userPosition.lineIndex === 0) return;

    const newCharIndex = gameState.snippet!.lines[gameState.userPosition.lineIndex - 1].text.length - 1;
    const newLineIndex = gameState.userPosition.lineIndex - 1;

    gameState.snippet!.lines[newLineIndex].text[gameState.snippet!.lines[newLineIndex].text.length - 1].state = CharacterState.Default;
    updateSnippetLines([...gameState.snippet!.lines]);
    updateUserPosition({lineIndex: newLineIndex, charIndex: newCharIndex});
    return;
  }

  let skippedChars;
  let newCharIndex = gameState.userPosition.charIndex;

  do {
    const previousWordPosition = getPreviousWordPosition(gameState, {charIndex: newCharIndex, lineIndex: gameState.userPosition.lineIndex});
    skippedChars = previousWordPosition.skippedChars;

    newCharIndex = previousWordPosition.charIndex;
  } while (skippedChars && skippedChars <= 1);

  for (let i = newCharIndex; i < gameState.snippet!.lines[gameState.userPosition.lineIndex].text.length; i++) {
    gameState.snippet!.lines[gameState.userPosition.lineIndex].text[i].state = CharacterState.Default;
  }

  updateSnippetLines([...gameState.snippet!.lines]);
  updateUserPosition({charIndex: newCharIndex});
}

