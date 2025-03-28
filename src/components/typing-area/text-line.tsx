"use client";

import type {ICharacter} from "@/types/character";
import React from "react";
import Character from "./character";

interface ITextLineProps {
  text: ICharacter[];
  lineIndex: number;
  charRefs: React.RefObject<{[key: string]: React.RefObject<HTMLSpanElement>}>;
  textHighlighting: string[];
}

function TextLine(props: ITextLineProps) {
  const {text, lineIndex, charRefs, textHighlighting} = props;

  return (
    <div className="flex flex-row whitespace-pre">
      {text.map((char: ICharacter, index: number) => {
        const charId = `char-${lineIndex}-${index}`;
        const charRef = React.createRef<HTMLSpanElement>() as React.RefObject<HTMLSpanElement>;
        charRefs.current[charId] = charRef;
        return <Character char={char} charHighlighting={textHighlighting[index]} ref={charRef} key={charId} />;
      })}
    </div>
  );
}

export default TextLine;
