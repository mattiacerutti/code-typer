import {CharacterState, CharacterTypes, ICharacter, WhitespaceTypes} from "@/types/character";
import {AUTO_CLOSING_CHARS, SHOULD_PRESERVE_CLOSING_CHAR_WHEN_DELETING} from "@/constants/game";
import {IParsedSnippet} from "@/types/snippet";


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

export function setCharacterState(snippet: IParsedSnippet, position: number, updateParsedSnippet: (parsedSnippet: IParsedSnippet) => void, state: CharacterState) {
  snippet[position].state = state;
  updateParsedSnippet(snippet);
}

export function getBindedClosingChar(snippet: IParsedSnippet, char: ICharacter, position: number) {
  let cont = 1;

  for (let i = position + 1; i < snippet.length; i++) {
    const currentChar = snippet[i];
    if (currentChar.value === AUTO_CLOSING_CHARS[char.value]) {
      cont--;
      if (cont === 0) {
        return currentChar;
      }
    }
    if (currentChar.value === char.value) {
      cont++;
    }
  }
  return undefined;
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

export function isClosingCharacter(char: ICharacter): boolean {
  return Object.values(AUTO_CLOSING_CHARS).includes(char.value) && char.type === CharacterTypes.Normal;
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
    if (SHOULD_PRESERVE_CLOSING_CHAR_WHEN_DELETING && snippet[i].state === CharacterState.Right && isClosingCharacter(snippet[i])) {
      continue;
    }

    snippet[i].state = CharacterState.Default;
    if (snippet[i].type === CharacterTypes.AutoClosing) {
      const bindedClosingChar = getBindedClosingChar(snippet, snippet[i], i);
      if (bindedClosingChar) {
        bindedClosingChar.state = CharacterState.Default;
      }
    }
  }
}
