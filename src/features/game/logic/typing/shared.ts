import {CharacterState, CharacterTypes, ICharacter, WhitespaceTypes} from "@/shared/types/character";
import {IParsedSnippet} from "@/shared/types/snippet";

export function getChar(snippet: IParsedSnippet, position: number): ICharacter {
  return snippet[position];
}

export function getPreviousChar(snippet: IParsedSnippet, position: number) {
  if (position <= 0) {
    return undefined;
  }
  const prevChar = getChar(snippet, position - 1);
  if (prevChar.value === WhitespaceTypes.Tab) {
    return getPreviousChar(snippet, position - 1);
  }
  return prevChar;
}

export function getLineStart(snippet: IParsedSnippet, position: number): number {
  let nonWhitespaceChar = position;
  for (let i = position; i >= 0; i--) {
    const char = getChar(snippet, i);
    if (char.value === WhitespaceTypes.NewLine && i !== position) {
      break;
    }
    if (char.value !== WhitespaceTypes.Tab && char.value !== WhitespaceTypes.NewLine) {
      nonWhitespaceChar = i;
    }
  }
  return nonWhitespaceChar;
}

export function setCharacterState(snippet: IParsedSnippet, position: number, state: CharacterState) {
  const char = snippet[position];

  if (char.state === state) {
    return;
  }

  if (state === CharacterState.Wrong) {
    char.state = CharacterState.Wrong;
    return;
  }

  if (char.type === CharacterTypes.AutoClosing) {
    snippet[position].state = state;
    if (char.isOpening) {
      snippet[char.pairedChar].state = state;
    }
    return;
  }

  snippet[position].state = state;
}

export function hasOnlyWhitespacesBefore(snippet: IParsedSnippet, position: number): boolean {
  let prevChar = getPreviousChar(snippet, position);
  while (prevChar && prevChar.value !== WhitespaceTypes.NewLine) {
    if (prevChar.type !== CharacterTypes.Whitespace) {
      return false;
    }
    position--;
    prevChar = getPreviousChar(snippet, position);
  }
  return true;
}

export function isFirstCharacter(snippet: IParsedSnippet, position: number): boolean {
  const prevChar = getPreviousChar(snippet, position);
  return prevChar === undefined || (prevChar.type === CharacterTypes.Whitespace && prevChar.value === WhitespaceTypes.NewLine) || hasOnlyWhitespacesBefore(snippet, position);
}

export function getPreviousLineEnd(snippet: IParsedSnippet, position: number): number | undefined {
  for (let i = position - 1; i >= 0; i--) {
    if (snippet[i].value === WhitespaceTypes.NewLine) {
      return i;
    }
  }
  return undefined;
}

export function resetCharactersInRange(snippet: IParsedSnippet, start: number, end: number) {
  for (let i = start; i <= end; i++) {
    const char = snippet[i];
    if (char.type === CharacterTypes.AutoClosing && !char.isOpening && char.state === CharacterState.Right) {
      continue;
    }
    setCharacterState(snippet, i, CharacterState.Default);
  }
}
