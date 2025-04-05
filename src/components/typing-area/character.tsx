import {ICharacter, CharacterState, WhitespaceTypes} from "@/types/character";
import {getCharacterText, getCharacterClasses} from "@/utils/client/character";

interface ICharacterProps {
  char: ICharacter;
  charHighlighting: string | null;
  isSelected: boolean;
  isInvisible: boolean;
}

function Character(props: ICharacterProps & {ref: React.RefObject<HTMLSpanElement | null>}) {
  const {char, charHighlighting, ref, isSelected, isInvisible} = props;

  const elementClasses = getCharacterClasses(char, charHighlighting);
  const elementText = getCharacterText(char);

  const hasOpacity = !isInvisible && !(char.value === WhitespaceTypes.NewLine && !isSelected && char.state !== CharacterState.Wrong);

  const spanStyle = {
    fontSize: char.value === WhitespaceTypes.NewLine ? "1rem" : "",
    fontWeight: char.value === WhitespaceTypes.NewLine ? "bold" : "",
    opacity: hasOpacity ? 1 : 0,
  };

  return (
    <span className={`${elementClasses} flex items-center justify-center`} ref={ref} style={spanStyle}>
      {elementText}
    </span>
  );
}

export default Character;
