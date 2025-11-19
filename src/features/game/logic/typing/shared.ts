import {produce} from "immer";
import {CharacterState, CharacterTypes, ICharacter, WhitespaceTypes} from "@/features/shared/types/character";
import {IParsedSnippet} from "@/features/shared/types/snippet";

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
  if (!char || char.state === state) {
    return;
  }

  const updateStateAt = (index: number, newState: CharacterState) => {
    const target = snippet[index];
    snippet[index] = {...target, state: newState};
  };

  if (state === CharacterState.Wrong) {
    updateStateAt(position, CharacterState.Wrong);
    return;
  }

  if (char.type === CharacterTypes.AutoClosing) {
    updateStateAt(position, state);
    if (char.isOpening) {
      updateStateAt(char.pairedChar, state);
    }
    return;
  }

  updateStateAt(position, state);
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

export function resetCharactersInRange(snippet: IParsedSnippet, start: number, end: number, ignoreAutoClosingRight: boolean): IParsedSnippet {
  return produce(snippet, (draft) => {
    for (let i = start; i <= end; i++) {
      const char = draft[i];
      if (!char) continue;
      if (ignoreAutoClosingRight && char.type === CharacterTypes.AutoClosing && !char.isOpening && char.state === CharacterState.Right) {
        continue;
      }
      setCharacterState(draft, i, CharacterState.Default);
    }
  });
}
