import { CharacterState } from "@/shared/types/character";
import { ICharacter, WhitespaceTypes } from "@/shared/types/character";

export function getCharacterText(char: ICharacter): string {
  switch (char.value) {
    case WhitespaceTypes.Space:
      return "\u00A0";
    case WhitespaceTypes.NewLine:
      return "\u00A0\u00A0⮐";
    case WhitespaceTypes.Tab:
      return "\u00A0\u00A0\u00A0";
    case "EOF":
      return "";
    default:
      return char.value;
  }
}

export function getCharacterClasses(char: ICharacter, charHighlighting: string | null): string {
  if (char.state === CharacterState.Wrong) {
    return "character-wrong";
  }
  if (char.state === CharacterState.Right ) {
    return charHighlighting ?? "";
  }
  return "character-default";
}
