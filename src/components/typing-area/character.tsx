import {ICharacter, CharacterState, WhitespaceTypes} from "@/types/character";

interface ICharacterProps {
  char: ICharacter;
  charHighlighting: string;
}

function Character(props: ICharacterProps & {ref: React.RefObject<HTMLSpanElement>}) {
  const {char, charHighlighting, ref} = props;

  let elementClasses = "character-default";
  let elementText = char.value;

  if (char.state == CharacterState.Right) {
    elementClasses = charHighlighting;
  }

  if (char.state == CharacterState.Wrong) {
    elementClasses = "character-wrong";
  }

  if (char.value == WhitespaceTypes.Space || char.value == WhitespaceTypes.NewLine) {
    elementText = "\u00A0";
  }

  if (char.value == WhitespaceTypes.Tab) {
    elementText = "\u00A0\u00A0\u00A0";
  }

  if (char.value == "EOF") {
    elementText = "";
  }

  return (
    <span
      className={elementClasses}
      ref={ref}
    >
      {elementText}
    </span>
  );
}

export default Character;
