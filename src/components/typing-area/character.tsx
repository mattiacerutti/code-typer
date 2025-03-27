import {ICharacter, CharacterState, WhitespaceTypes} from "@/types/characther";

interface ICharacterProps {
  char: ICharacter;
  charId: string;
  charStyle: string;
}

function Character(props: ICharacterProps & {ref: React.RefObject<HTMLSpanElement>}) {
  const {char, charId, charStyle, ref} = props;

  let elementClasses = "character-default";
  let elementText = char.value;

  if (char.state == CharacterState.Right) {
    elementClasses = charStyle;
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
      id={charId}
      ref={ref}
    >
      {elementText}
    </span>
  );
}

export default Character;
