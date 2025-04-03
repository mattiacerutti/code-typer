"use client";

import React, {useRef, useEffect} from "react";
import useCodeHighlight from "@/hooks/useCodeHighlight";
import {CharacterTypes, ICharacter, WhitespaceTypes} from "@/types/character";
import {isGameFinished} from "@/utils/game";
import {GameStatus} from "@/types/game-state";
import {useGameState} from "@/contexts/GameStateContext";
import Caret from "./typing-area/caret";
import Character from "./typing-area/character";

interface ITypingAreaProps {
  onGameFinished: () => void;
}

function TypingArea(props: ITypingAreaProps) {
  const {onGameFinished} = props;

  const {state, dispatch} = useGameState();

  if (state.status !== GameStatus.PLAYING && state.status !== GameStatus.READY) {
    throw new Error("TypingArea: Received invalid snippet or language");
  }

  // Handles code styling
  const {codeHighlight} = useCodeHighlight(state.currentSnippet.text, state.language);

  // Collection of all character refs, used to know where every character is at and to update caret position
  const charRefs = useRef<React.RefObject<HTMLSpanElement>[]>([]);

  // Everytime the state updates, we check if the user is at the end. If so we check every character.
  useEffect(() => {
    if (state.status === GameStatus.PLAYING && state.userPosition === state.currentSnippet.parsedSnippet.length - 1) {
      if (!isGameFinished(state.currentSnippet.parsedSnippet)) {
        return;
      }

      dispatch({type: "SET_GAME_STATUS", payload: GameStatus.FINISHED});
      onGameFinished();
    }
  }, [onGameFinished, state, dispatch]);

  return (
    <div className="flex flex-col justify-center items-center bg-slate-100 rounded-2xl shadow-lg p-10">
      <div className="relative flex justify-center items-center">
        <div className="text-slate-700 text-3xl flex flex-col gap-1.5 select-none">
          {(() => {
            const groups: {char: ICharacter; index: number}[][] = [];
            let current: {char: ICharacter; index: number}[] = [];

            state.currentSnippet.parsedSnippet.forEach((char: ICharacter, index: number) => {
              current.push({char, index});

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
                  return (
                    <Character
                      key={index}
                      char={item.char}
                      charHighlighting={codeHighlight?.[index] ?? null}
                      isSelected={index === state.userPosition}
                      ref={charRefs.current[index]}
                    />
                  );
                })}
              </div>
            ));
          })()}
        </div>
        <Caret charRefs={charRefs.current} />
      </div>
    </div>
  );
}

export default TypingArea;
