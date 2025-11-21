import {CharacterState, WhitespaceTypes} from "@/features/shared/types/character";
import React from "react";

interface ICharacterProps {
  value: string;
  state: CharacterState;
  elementText: string;
  elementClasses: string;
  isSelected: boolean;
  isInvisible: boolean;
}

function Character(props: ICharacterProps & {ref: React.RefObject<HTMLSpanElement | null>}) {
  const {value, state, elementText, elementClasses, isSelected, isInvisible, ref} = props;

  const hasOpacity = !isInvisible && !(value === WhitespaceTypes.NewLine && !isSelected && state !== CharacterState.Wrong);

  const spanStyle = {
    fontSize: value === WhitespaceTypes.NewLine ? "1rem" : undefined,
    fontWeight: value === WhitespaceTypes.NewLine ? "bold" : undefined,
    opacity: hasOpacity ? 1 : 0,
  };

  return (
    <span className={`${elementClasses} flex items-center justify-center`} ref={ref} style={spanStyle}>
      {elementText}
    </span>
  );
}

export default React.memo(Character);
