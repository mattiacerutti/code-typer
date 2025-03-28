import {CharacterState, ICharacter} from "@/types/character";
import {getFirstNonWhitespaceCharacter, isFirstCharacter} from "./shared";
import {IGameState} from "@/types/game-state";
import {ITextLine} from "@/types/text-line";

export function deleteLine(
  gameState: IGameState,
  updateSnippetLines: (lines: ITextLine[]) => void,
  updateUserPosition: (position: {lineIndex?: number; charIndex?: number}) => void
) {
  if (isFirstCharacter(gameState, gameState.userPosition)) {
    if (gameState.userPosition.lineIndex === 0) return;

    const newCharIndex = gameState.snippet!.lines[gameState.userPosition.lineIndex - 1].text.length - 1;
    const newLineIndex = gameState.userPosition.lineIndex - 1;

    gameState.snippet!.lines[newLineIndex].text[gameState.snippet!.lines[newLineIndex].text.length - 1].state = CharacterState.Default;
    updateSnippetLines([...gameState.snippet!.lines]);
    updateUserPosition({lineIndex: newLineIndex, charIndex: newCharIndex});
    return;
  }
  gameState.snippet!.lines[gameState.userPosition.lineIndex].text.map((char: ICharacter) => {
    char.state = CharacterState.Default;
  });
  updateSnippetLines([...gameState.snippet!.lines]);
  updateUserPosition({charIndex: getFirstNonWhitespaceCharacter(gameState, gameState.userPosition.lineIndex)});
}
