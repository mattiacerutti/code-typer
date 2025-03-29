"use client";

import {useRef, useEffect} from "react";
import useCodeHighlight from "@/hooks/useCodeHighlight";
import {CharacterState, CharacterTypes, ICharacter, WhitespaceTypes} from "@/types/character";
import {isGameFinished} from "@/utils/game";
import {useGameState} from "@/contexts/game-state/GameStateContext";
import {GameStatus} from "@/types/game-state";
import Caret from "./typing-area/caret";

//Custom theme for code highlighting
import "highlight.js/styles/github.css";
import Character from "./typing-area/character";
import React from "react";

interface ITypingAreaProps {
  onGameFinished: () => void;
  onGameStarted: () => void;
}

function TypingArea(props: ITypingAreaProps) {
  const {onGameFinished, onGameStarted} = props;

  const {gameState, caretRef} = useGameState();

  if (!gameState.snippet || !gameState.language) {
    throw "Snippet or language not found";
  }

  // Handles code styling
  const {codeHighlight} = useCodeHighlight(gameState.snippet.text, gameState.language);

  // Collection of all character refs, used to know where every character is at and to update caret position
  const charRefs = useRef<React.RefObject<HTMLSpanElement>[]>([]);

  useEffect(() => {
    if (gameState.snippet) {
      if (gameState.snippet.parsedSnippet.length > 0 && gameState.status !== GameStatus.Finished && isGameFinished(gameState.snippet.parsedSnippet)) {
        gameState.status = GameStatus.Finished;
        onGameFinished();
      }
    }
  }, [onGameFinished, gameState]);

  useEffect(() => {
    if (gameState.snippet) {
      if (gameState.snippet.parsedSnippet.length > 0 && gameState.status === GameStatus.NotStarted && gameState.snippet.parsedSnippet[0].state !== CharacterState.Default) {
        gameState.status = GameStatus.Started;
        onGameStarted();
      }
    }
  }, [onGameStarted, gameState]);

  if (gameState.snippet.parsedSnippet.length > 0 && codeHighlight.length > 0 && caretRef.current) {
    return (
      <div className="flex flex-col justify-center items-center bg-slate-100 rounded-2xl shadow-lg p-10">
        <div className="relative flex justify-center items-center">
          <div className="text-slate-700 text-3xl flex flex-col gap-1.5 select-none">
            {(() => {
              const groups: {char: ICharacter, index: number}[][] = [];
              let current: {char: ICharacter, index: number}[] = [];

              gameState.snippet.parsedSnippet.forEach((char, index) => {
                current.push({ char, index });
        
                if (char.type === CharacterTypes.Whitespace && char.value === WhitespaceTypes.NewLine) {
                  groups.push([...current]);
                  current = [];
                }
              });
        
              if (current.length > 0) groups.push([...current]);

              return groups.map((group, idx) => (
                <div key={idx} className="flex flex-row whitespace-pre">
                  {group.map((item) => {
                    const index = item.index;
                    const charRef = React.createRef<HTMLSpanElement>() as React.RefObject<HTMLSpanElement>;
                    charRefs.current[index] = charRef;
                    return <Character key={index} char={item.char} charHighlighting={codeHighlight[index]} ref={charRefs.current[index]} />;
                  })}
                </div>
              ));
            })()}
          </div>
          <Caret charRefs={charRefs.current} ref={caretRef as React.RefObject<{setCaretIndex: (position: number) => void}>} />
        </div>
      </div>
    );
  }

  return <></>;
}

export default TypingArea;
