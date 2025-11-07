import {IParsedSnippet} from "@/shared/types/snippet";
import {getChar} from "./shared";
import {CharacterState, CharacterTypes} from "@/shared/types/character";

export function skipCharacter(snippet: IParsedSnippet, position: number): [IParsedSnippet, number] {
  const expectedChar = getChar(snippet, position);
  if (expectedChar.type !== CharacterTypes.AutoClosing || expectedChar.isOpening || expectedChar.state !== CharacterState.Right) return [snippet, position];

  const newPosition = position + 1;

  return [snippet, newPosition];
}
