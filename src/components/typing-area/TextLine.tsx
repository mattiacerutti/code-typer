import Character from "./Character";
import type { ICharacter} from "@/types/Character";


interface ITextLineProps {
  lineText: ICharacter[];
  lineIndex: number;
  charRefs: React.MutableRefObject<{[key: string]: HTMLSpanElement | null}>;
  lineStyle: string[];
}


function TextLine(props: ITextLineProps) {

  const {lineText, lineIndex, charRefs, lineStyle} = props;
  
  return (
    <div className="flex flex-row whitespace-pre">
      {lineText.map((char: ICharacter, index: number) => {
        const charId = `char-${lineIndex}-${index}`;
        return <Character char={char} charId={charId} charRefs={charRefs} key={charId} charStyle={lineStyle[index]} />;
      })}
    </div>
  );
}

export default TextLine;
