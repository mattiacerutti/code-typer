import {createRef, useEffect} from "react";
import useCodeHighlight from "@/features/game/hooks/useCodeHighlight";
import {CharacterTypes, ICharacter, WhitespaceTypes} from "@/features/shared/types/character";
import {isGameFinished} from "@/features/game/logic/game-logic";
import {GameStatus} from "@/features/game/types/game-status";
import Caret from "./caret";
import Character from "./character";
import {useGameStore} from "@/features/game/state/game-store";
import {getCharacterClasses, getCharacterText} from "@/features/game/utils/character";

interface ITypingAreaProps {
  onGameFinished: () => void;
}

function TypingArea(props: ITypingAreaProps) {
  const {onGameFinished} = props;

  const status = useGameStore((state) => state.status);
  const language = useGameStore((state) => state.language)!;
  const currentSnippet = useGameStore((state) => state.currentSnippet)!;
  const userPosition = useGameStore((state) => state.userPosition)!;

  // Handles code styling and syntax highlighting
  const {codeHighlight} = useCodeHighlight(currentSnippet.rawSnippet.content, language.highlightAlias);

  // Collection of all character refs, used to know where every character is at and to update caret position
  const charRefs = Array.from({length: currentSnippet.parsedSnippet.length}, () => createRef<HTMLSpanElement>());

  const groupedCharacters = (() => {
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
  })();

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
    <div className="flex flex-col items-center justify-center rounded-2xl bg-(--color-surface) p-10 shadow-lg">
      <div className="relative flex items-center justify-center">
        <div className="flex flex-col gap-1.5 text-3xl select-none">
          {groupedCharacters.map((group, groupIndex) => (
            <div key={groupIndex} className="flex flex-row whitespace-pre">
              {group.map((item) => {
                const index = item.index;
                const char = item.char;

                const isInvisible =
                  (index > 0 && char.value === WhitespaceTypes.NewLine && currentSnippet.parsedSnippet[index - 1].value === WhitespaceTypes.NewLine) ||
                  char.value === WhitespaceTypes.Tab;

                return (
                  <Character
                    key={index}
                    value={char.value}
                    state={char.state}
                    elementClasses={getCharacterClasses(char, codeHighlight?.[index])}
                    elementText={getCharacterText(char)}
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

export default TypingArea;
