import {useRef, useEffect } from "react";
import TextLine from "./typing-area/TextLine";
import Caret from "./typing-area/Caret";
import useCodeParser from "@/hooks/useCodeParser";
import useKeyboardHandler from "@/hooks/useKeyboardHandler/useKeyboardHandler";
import useCodeStyler from "@/hooks/useCodeStyler";

//Custom theme for code highlighting
import "highlight.js/styles/github.css";

import {CharacterState} from "@/types/Character";
import {isGameFinished} from "@/utils/game-utils";
import {useGameState} from "@/contexts/game-state/GameStateContext";
import { GameStatus } from "@/types/GameState";

interface ITypingAreaProps {
  onGameFinished: () => void;
  onGameStarted: () => void;
  setIsCapsLockOn: React.Dispatch<React.SetStateAction<boolean>>;
}

function TypingArea(props: ITypingAreaProps) {
  const { onGameFinished, onGameStarted, setIsCapsLockOn} = props;

  const {gameState} = useGameState();

  if(!gameState.snippet || !gameState.language) {
    throw("Snippet or language not found");
  }

  // Handles code parsing
  const {lines, setLines, autoClosingChars} = useCodeParser(gameState.snippet);

  // Handles code styling
  const {codeStyle} = useCodeStyler(gameState.snippet, gameState.language, lines);

  // Handles keyboard events and cursor position
  const {userPosition} = useKeyboardHandler(lines, setLines, autoClosingChars, setIsCapsLockOn);

  // Collection of all character refs, used to know where every character is at and to update caret position
  const charRefs = useRef<{[key: string]: HTMLSpanElement | null}>({});


  // Handles caret position
  const caretRef = useRef<{
    setCaretIndex: (lineIndex: number, charIndex: number) => void;
  }>(null);


  useEffect(() => {
    if (lines.length > 0 && gameState.status !== GameStatus.Finished && isGameFinished(lines)) {
      gameState.status = GameStatus.Finished;
      onGameFinished();
    }
  }, [onGameFinished, lines, gameState]);

  useEffect(() => {
    if (lines.length > 0 && gameState.status === GameStatus.NotStarted && lines[0].text[0].state !== CharacterState.Default) {
      gameState.status = GameStatus.Started;
      onGameStarted();
    }
  }, [onGameStarted, lines, gameState]);

  useEffect(() => {
    // Updates the caret position everytime the user position changes
    if (caretRef.current) {
      caretRef.current.setCaretIndex(userPosition.lineIndex, userPosition.charIndex);
    }
  }, [userPosition]);


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

export default TypingArea;
