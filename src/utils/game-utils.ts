import { CharacterState, CharacterTypes, WhitespaceTypes } from "@/types/Character";
import { ILine } from "@/types/Line";

export function isGameFinished(lines: ILine[]) {
  const allCorrect = lines.every((line) => {
    return line.text.every(
      (char) =>
        char.state === CharacterState.Right ||
        (char.state === CharacterState.Default && char.value === WhitespaceTypes.NewLine) ||
        char.value === WhitespaceTypes.Tab ||
        char.type === CharacterTypes.EOF
    );
  });

  return allCorrect;
}
