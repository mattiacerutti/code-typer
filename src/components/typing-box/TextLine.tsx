import Character from "./Character";
import type { ICharacter} from "@/types/Character";

function TextLine({
  lineText,
  lineIndex,
  charRefs,
  lineStyle,
}: {
  lineText: ICharacter[];
  lineIndex: number;
  charRefs: React.MutableRefObject<{[key: string]: HTMLSpanElement | null}>;
  lineStyle: string[];
}) {
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
