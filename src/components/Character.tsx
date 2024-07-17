import { type Character, CharacterState, WhitespaceTypes } from "../models/Characters";


function Character({char, charId} : { char: Character, charId: string }) {

   let className = "text-slate-400 bg-inherit";
   let text = char.value;

   switch(char.state) {
      case CharacterState.Right:
         className = "text-black"
         break;
      case CharacterState.Wrong:
         className = "bg-red-600"
         break;
   }

   switch(char.value) {
      case WhitespaceTypes.Space:
      case WhitespaceTypes.NewLine:
         text = '\u00A0';
         break;
      case WhitespaceTypes.Tab:
         text = '\u00A0\u00A0\u00A0';
         break;
      case "EOF":
         text = ""
   }

	return (
		<span className={className} id={charId}>{text}</span>
	);
}

export default Character;
