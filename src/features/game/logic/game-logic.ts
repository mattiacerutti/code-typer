import {CharacterState, CharacterTypes, WhitespaceTypes} from "@/shared/types/character";
import {IParsedSnippet} from "@/shared/types/snippet";

export function isGameFinished(parsedSnippets: IParsedSnippet) {
  const allCorrect = parsedSnippets.every(
    (char) =>
      char.state === CharacterState.Right ||
      char.type === CharacterTypes.EOF ||
      (char.type === CharacterTypes.Whitespace && (char.value === WhitespaceTypes.NewLine || char.value === WhitespaceTypes.Tab))
  );

  return allCorrect;
}
