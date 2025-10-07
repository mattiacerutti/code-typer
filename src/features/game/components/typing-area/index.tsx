import React, {memo, useEffect, useMemo} from "react";
import useCodeHighlight from "@/features/game/hooks/useCodeHighlight";
import {CharacterTypes, ICharacter, WhitespaceTypes} from "@/shared/types/character";
import {isGameFinished} from "@/features/game/logic/game-logic";
import {GameStatus} from "@/features/game/types/game-state";
import Caret from "./caret";
import Character from "./character";
import { useGameStore } from "@/features/game/state/game-store";

interface ITypingAreaProps {
  onGameFinished: () => void;
}

function TypingArea(props: ITypingAreaProps) {
  const {onGameFinished} = props;

    const status = useGameStore((state) => state.status);
    const language = useGameStore((state) => state.language)!;
    const currentSnippet = useGameStore((state) => state.currentSnippet)!;
    const userPosition = useGameStore((state) => state.userPosition);

  // Handles code styling and syntax highlighting
  const {codeHighlight} = useCodeHighlight(currentSnippet.text, language.highlightAlias);

  // Collection of all character refs, used to know where every character is at and to update caret position
  const charRefs = useMemo(() => currentSnippet.parsedSnippet.map(() => React.createRef<HTMLSpanElement>()), [currentSnippet.parsedSnippet]);

  const groupedCharacters = useMemo(() => {
    const groups: {char: ICharacter; index: number}[][] = [];
    let current: {char: ICharacter; index: number}[] = [];

    currentSnippet.parsedSnippet.forEach((char, index) => {
      current.push({char, index});
      if (char.type === CharacterTypes.Whitespace && char.value === WhitespaceTypes.NewLine) {
        groups.push([...current]);
        current = [];
      }
    });

    if (current.length > 0) groups.push([...current]);
    return groups;
  }, [currentSnippet.parsedSnippet]);

  // Everytime the state updates, we check if the user is at the end. If so we check every character.
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      if (!isGameFinished(currentSnippet.parsedSnippet)) {
        return;
      }

      onGameFinished();
    }
  }, [status, userPosition, currentSnippet.parsedSnippet, onGameFinished]);

  return (
    <div className="flex flex-col justify-center items-center bg-slate-100 rounded-2xl shadow-lg p-10">
      <div className="relative flex justify-center items-center">
        <div className="text-slate-700 text-3xl flex flex-col gap-1.5 select-none">
          {groupedCharacters.map((group, groupIndex) => (
            <div key={groupIndex} className="flex flex-row whitespace-pre">
              {group.map((item) => {
                const index = item.index;
                const isInvisible =
                  (index > 0 && item.char.value === WhitespaceTypes.NewLine && currentSnippet.parsedSnippet[index - 1].value === WhitespaceTypes.NewLine) ||
                  item.char.value === WhitespaceTypes.Tab;

                return (
                  <Character
                    key={index}
                    char={item.char}
                    charHighlighting={codeHighlight?.[index] ?? null}
                    isSelected={index === userPosition}
                    isInvisible={isInvisible}
                    ref={charRefs[index]}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <Caret charRefs={charRefs} userPosition={userPosition} />
      </div>
    </div>
  );
}

export default memo(TypingArea);
