import {CharacterState, CharacterTypes} from "@/shared/types/character";
import { IParsedSnippet } from "@/shared/types/snippet";

export function isGameFinished(parsedSnippets: IParsedSnippet) {
  const allCorrect = parsedSnippets.every(
    (char) =>
      char.state === CharacterState.Right ||
      char.type === CharacterTypes.EOF
  );

  return allCorrect;
}
