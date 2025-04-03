import {ICharacter, CharacterState, WhitespaceTypes} from "@/types/character";

interface ICharacterProps {
  char: ICharacter;
  charHighlighting: string | null;
  isSelected?: boolean;
}

function Character(props: ICharacterProps & {ref: React.RefObject<HTMLSpanElement>}) {
  const {char, charHighlighting, ref, isSelected = false} = props;

  
  let elementClasses = "character-default";
  let elementText = char.value;
  
  if (char.state == CharacterState.Right) {
    elementClasses = charHighlighting ?? "character-default";
  }

  if (char.state == CharacterState.Wrong) {
    elementClasses = "character-wrong";
  }

  if (char.value == WhitespaceTypes.Space) {
    elementText = "\u00A0";
  }

  if (char.value == WhitespaceTypes.NewLine) {
    elementText = "\u00A0\u00A0⮐";
  }

  if (char.value == WhitespaceTypes.Tab) {
    elementText = "\u00A0\u00A0\u00A0";
  }

  if (char.value == "EOF") {
    elementText = "";
  }

  return (
    <span
      className={`${elementClasses} flex items-center justify-center`}
      ref={ref}
      style={{
        fontSize: char.value == WhitespaceTypes.NewLine ? "1rem" : "",
        fontWeight: char.value == WhitespaceTypes.NewLine ? "bold" : "",
        opacity: char.value == WhitespaceTypes.NewLine && !isSelected && char.state !== CharacterState.Wrong ? 0 : 1,
      }}
    >
      {elementText}
    </span>
  );
}

export default Character;
