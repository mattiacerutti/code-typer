import {type ICharacter, CharacterState, WhitespaceTypes} from "@/types/Character";

interface ICharacterProps {
  char: ICharacter;
  charId: string;
  charStyle: string;
  charRefs: React.MutableRefObject<{[key: string]: HTMLSpanElement | null}>;
}

function Character(props: ICharacterProps) {

   const {char, charId, charStyle, charRefs} = props;

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
      <span className={elementClasses} id={charId} ref={(el) => (charRefs.current[charId] = el)}>
         {elementText}
      </span>
   );
}

export default Character;
