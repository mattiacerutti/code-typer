import {getLineStart, getPreviousLineEnd, isFirstCharacter, resetCharactersInRange} from "@/lib/client/typing/shared";
import {IGameStatePlaying, IGameStateReady} from "@/types/game-state";
import {IParsedSnippet} from "@/types/snippet";

export function deleteLine(
  state: IGameStatePlaying | IGameStateReady,
  updateParsedSnippet: (parsedSnippet: IParsedSnippet) => void,
  updateUserPosition: (position: number) => void
) {
  const position = state.userPosition;
  const snippet = state.currentSnippet.parsedSnippet;
  if (position === 0) return;

  let newPos = getLineStart(snippet, position);

  if (isFirstCharacter(snippet, position)) {
    let previousLineEnd = getPreviousLineEnd(snippet, position);

    while (previousLineEnd && getLineStart(snippet, previousLineEnd) === previousLineEnd) {
      previousLineEnd = getPreviousLineEnd(snippet, previousLineEnd);
    }

    if (!previousLineEnd) {
      throw new Error("Couldn't find a previous line. This error should never happen.");
    }

    newPos = previousLineEnd;
  }

  resetCharactersInRange(snippet, newPos, position);

  updateParsedSnippet(snippet);
  updateUserPosition(newPos);
}
