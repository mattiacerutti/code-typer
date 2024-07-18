import Character from "./Character";

function TextLine({
   lineText,
   lineIndex,
   charRefs,
   lineStyle,
}: {
   lineText: Character[];
   lineIndex: number;
   charRefs: React.MutableRefObject<{[key: string]: HTMLSpanElement | null}>;
   lineStyle: string[];
}) {
   return (
      <div className="flex flex-row whitespace-pre">
         {lineText.map((char: Character, index: number) => {
            const charId = `char-${lineIndex}-${index}`;
            return <Character char={char} charId={charId} charRefs={charRefs} key={charId} charStyle={lineStyle[index]} />;
         })}
      </div>
   );
}

export default TextLine;
