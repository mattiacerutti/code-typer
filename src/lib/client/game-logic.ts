import {CharacterState, CharacterTypes, WhitespaceTypes} from "@/types/character";
import { IParsedSnippet } from "@/types/snippet";

export function isGameFinished(parsedSnippets: IParsedSnippet) {
  const allCorrect = parsedSnippets.every(
    (char) =>
      char.state === CharacterState.Right ||
      char.value === WhitespaceTypes.Tab ||
      (char.value === WhitespaceTypes.NewLine && char.state === CharacterState.Default) ||
      char.type === CharacterTypes.EOF
  );

  return allCorrect;
}
