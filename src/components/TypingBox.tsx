import {useRef, useEffect, useMemo} from "react";
import TextLine from "./typing-box/TextLine";
import Caret from "./typing-box/Caret";
import useCodeParser from "@/hooks/useCodeParser";
import useKeyboardHandler from "@/hooks/useKeyboardHandler/useKeyboardHandler";
import useCodeStyler from "@/hooks/useCodeStyler";

//Custom theme for code highlighting
import "highlight.js/styles/github.css";

import {LanguageName} from "@/types/CodeLanguage";
import {CharacterState, CharacterTypes, WhitespaceTypes} from "@/types/Character";
import {isGameFinished} from "@/utils/game-utils";

function TypingBox({codeSnippet, codeLanguage, onGameFinished}: {codeSnippet: string; codeLanguage: LanguageName; onGameFinished: () => void}) {
  // Handles code parsing
  const {lines, setLines, autoClosingChars} = useCodeParser(codeSnippet);

  // Handles code styling
  const {codeStyle} = useCodeStyler(codeSnippet, codeLanguage, lines);

  // Handles keyboard events and cursor position
  const {userPosition} = useKeyboardHandler(lines, setLines, autoClosingChars);

  // Collection of all character refs, used to know where every character is at and to update caret position
  const charRefs = useRef<{[key: string]: HTMLSpanElement | null}>({});

  // Handles caret position
  const caretRef = useRef<{
    setCaretIndex: (lineIndex: number, charIndex: number) => void;
  }>(null);

  const hasFinished = useMemo(() => {
    if (lines.length > 0) {
      //Check for win

      const allCorrect = lines.every((line) => {
        const check = line.text.every(
          (char) =>
            char.state === CharacterState.Right ||
            (char.state === CharacterState.Default && char.value === WhitespaceTypes.NewLine) ||
            char.value === WhitespaceTypes.Tab ||
            char.type === CharacterTypes.EOF
        );
        return check;
      });

      return allCorrect;
    }
    return false;
  }, [lines]);

  useEffect(() => {
    if (lines.length > 0 && isGameFinished(lines)) {
      onGameFinished();
    }
  }, [onGameFinished, lines]);

  useEffect(() => {
    // Updates the caret position everytime the user position changes
    if (caretRef.current) {
      caretRef.current.setCaretIndex(userPosition.lineIndex, userPosition.charIndex);
    }
  }, [userPosition]);

  if (hasFinished) {
    return <div className="text-slate-700 text-3xl flex flex-col gap-1.5 select-none">YOU WIN</div>;
  }

  if (lines.length > 0 && codeStyle.length > 0) {
    return (
      <div className="flex flex-col justify-center items-center bg-slate-100 rounded-2xl shadow-lg p-10">
        <div className="relative flex justify-center items-center">
          <div className="text-slate-700 text-3xl flex flex-col gap-1.5 select-none">
            {lines.map((line, index) => {
              return <TextLine key={index} lineText={line.text} lineIndex={index} charRefs={charRefs} lineStyle={codeStyle[index]} />;
            })}
          </div>
          <Caret charRefs={charRefs} ref={caretRef} />
        </div>
      </div>
    );
  }

  return <></>;
}

export default TypingBox;
