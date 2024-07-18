import React, {useRef, useEffect} from "react";
import TextLine from "./text-box/TextLine";
import Caret from "./text-box/Caret";
import useCodeParser from "@/hooks/useCodeParser";
import useKeyboardHandler from "@/hooks/useKeyboardHandler/useKeyboardHandler";
import useCodeStyler from "@/hooks/useCodeStyler";
import "highlight.js/styles/github.css";


const TextBox: React.FC = () => {
   const originalText: string =
      "Label *makeLabel(Context *context)\n{\n\tLabel *ret = xmalloc(sizeof(*ret));\n\n\tret->name = xmalloc(12);\n\tsprintf(ret->name, \"'lbl%s'\", makeHexadecimalValue(8));\n\tcontext->currfunc->numlabels++;\n\n\taddLabelToList(ret, &context->currfunc->labels);\n\n\treturn ret;\n}";

   // Handles code parsing
   const {lines, setLines, autoClosingChars} = useCodeParser(originalText);

   // Handles code styling
   const {codeStyle} = useCodeStyler(originalText, "cpp", lines);

   // Handles keyboard events and cursor position
   const {userPosition} = useKeyboardHandler(lines, setLines, autoClosingChars);

   // Collection of all character refs, used to know where every character is at and to update caret position
   const charRefs = useRef<{[key: string]: HTMLSpanElement | null}>({});

   // Handles caret position
   const caretRef = useRef<{
      setCaretIndex: (lineIndex: number, charIndex: number) => void;
   }>(null);


   useEffect(() => {
      // Updates the caret position everytime the user position changes
      if (caretRef.current) {
         caretRef.current.setCaretIndex(userPosition.lineIndex, userPosition.charIndex);
      }
   }, [userPosition]);

   if (lines.length > 0 && codeStyle.length > 0) {
      return (
         <div className="relative flex justify-center items-center">
            <div className="text-slate-700 text-3xl flex flex-col gap-1.5 select-none">
               {lines.map((line, index) => {
                  return <TextLine key={index} lineText={line.text} lineIndex={index} charRefs={charRefs} lineStyle={codeStyle[index]} />;
               })}
            </div>
            <Caret charRefs={charRefs} ref={caretRef} />
         </div>
      );
   }

   return <></>;
};

export default TextBox;
