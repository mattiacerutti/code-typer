import {useRef, useEffect} from "react";
import TextLine from "./typing-area/TextLine";
import Caret from "./typing-area/Caret";
import useKeyboardHandler from "@/hooks/useKeyboardHandler/useKeyboardHandler";
import useCodeStyler from "@/hooks/useCodeStyler";

//Custom theme for code highlighting
import "highlight.js/styles/github.css";

import {CharacterState} from "@/types/Character";
import {isGameFinished} from "@/utils/game-utils";
import {useGameState} from "@/contexts/game-state/GameStateContext";
import {GameStatus} from "@/types/GameState";

interface ITypingAreaProps {
  onGameFinished: () => void;
  onGameStarted: () => void;
  setIsCapsLockOn: React.Dispatch<React.SetStateAction<boolean>>;
}

function TypingArea(props: ITypingAreaProps) {
  const {onGameFinished, onGameStarted, setIsCapsLockOn} = props;

  const {gameState, updateSnippetLines, caretRef, updateUserPosition} = useGameState();

  if (!gameState.snippet || !gameState.language) {
    throw "Snippet or language not found";
  }

  const onWrongKeystroke = () => {
    gameState.wrongKeystrokes += 1;
  };

  const onValidKeystroke = () => {
    gameState.validKeystrokes += 1;
  };

  // Handles code styling
  const {codeStyle} = useCodeStyler(gameState.snippet.text, gameState.language, gameState.snippet.lines);

  // Handles keyboard events and cursor position
  useKeyboardHandler(gameState.snippet.lines, updateSnippetLines, gameState.userPosition, updateUserPosition, setIsCapsLockOn, onWrongKeystroke, onValidKeystroke);

  // Collection of all character refs, used to know where every character is at and to update caret position
  const charRefs = useRef<{[key: string]: HTMLSpanElement | null}>({});

  useEffect(() => {
    if (gameState.snippet) {
      if (gameState.snippet.lines.length > 0 && gameState.status !== GameStatus.Finished && isGameFinished(gameState.snippet.lines)) {
        gameState.status = GameStatus.Finished;
        onGameFinished();
      }
    }
  }, [onGameFinished, gameState]);

  useEffect(() => {
    if (gameState.snippet) {
      if (gameState.snippet.lines.length > 0 && gameState.status === GameStatus.NotStarted && gameState.snippet.lines[0].text[0].state !== CharacterState.Default) {
        gameState.status = GameStatus.Started;
        onGameStarted();
      }
    }
  }, [onGameStarted, gameState]);

  if (gameState.snippet.lines.length > 0 && codeStyle.length > 0) {
    return (
      <div className="flex flex-col justify-center items-center bg-slate-100 rounded-2xl shadow-lg p-10">
        <div className="relative flex justify-center items-center">
          <div className="text-slate-700 text-3xl flex flex-col gap-1.5 select-none">
            {gameState.snippet.lines.map((line, index) => {
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
