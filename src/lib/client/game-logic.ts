import {CharacterState, CharacterTypes} from "@/types/character";
import { IParsedSnippet } from "@/types/snippet";

export function isGameFinished(parsedSnippets: IParsedSnippet) {
  const allCorrect = parsedSnippets.every(
    (char) =>
      char.state === CharacterState.Right ||
      char.type === CharacterTypes.EOF
  );

  return allCorrect;
}
