"use client";



import type { ICharacter} from "@/types/characther";
import React from "react";
import Character from "./Character";

interface ITextLineProps {
  lineText: ICharacter[];
  lineIndex: number;
  charRefs: React.RefObject<{[key: string]: React.RefObject<HTMLSpanElement>}>;
  lineStyle: string[];
}


function TextLine(props: ITextLineProps) {

  const {lineText, lineIndex, charRefs, lineStyle} = props;
  
  return (
    <div className="flex flex-row whitespace-pre">
      {lineText.map((char: ICharacter, index: number) => {
        const charId = `char-${lineIndex}-${index}`;
        const charRef = React.createRef<HTMLSpanElement>() as React.RefObject<HTMLSpanElement>;
        charRefs.current[charId] = charRef;
        return <Character char={char} charId={charId}  charStyle={lineStyle[index]}  ref={charRef} key={charId} />;
      })}
    </div>
  );
}

export default TextLine;
