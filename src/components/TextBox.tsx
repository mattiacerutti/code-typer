import React, {useRef, useEffect} from "react";
import TextLine from "./TextLine";
import Caret from "./Caret";
import useTextParser from "../hooks/useTextParser";
import useKeyboardHandler from "../hooks/useKeyboardHandler";

const TextBox: React.FC = () => {
   const originalText: string =
      "Label *makeLabel(Context *context)\n{\n\tLabel *ret = xmalloc(sizeof(*ret));\n\n\tret->name = xmalloc(12);\n\tsprintf(ret->name, \"'lbl%s'\", makeHexadecimalValue(8));\n\tcontext->currfunc->numlabels++;\n\n\taddLabelToList(ret, &context->currfunc->labels);\n\n\treturn ret;\n}";

   const {lines, setLines, autoClosingChars} = useTextParser(originalText);
   const {userPosition} = useKeyboardHandler(lines, setLines, autoClosingChars);

   const charRefs = useRef<{[key: string]: HTMLSpanElement | null}>({});

   const caretRef = useRef<{
      setCaretIndex: (lineIndex: number, charIndex: number) => void;
   }>(null);

   useEffect(() => {
      // Update caret position after lines are set
      if (caretRef.current) {
         caretRef.current.setCaretIndex(userPosition.lineIndex, userPosition.charIndex);
      }
   }, [lines, userPosition]);

   if (lines.length > 0) {
      return (
         <div className="relative flex justify-center items-center">
            <div className="text-slate-700 text-3xl flex flex-col gap-1.5">
               {lines.map((line, index) => (
                  <TextLine key={index} text={line.text} lineIndex={index} charRefs={charRefs} />
               ))}
            </div>
            <Caret charRefs={charRefs} ref={caretRef} />
         </div>
      );
   }

   return <></>;
};

export default TextBox;
