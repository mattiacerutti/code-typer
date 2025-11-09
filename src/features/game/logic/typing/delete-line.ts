import {getLineStart, getPreviousLineEnd, isFirstCharacter, resetCharactersInRange} from "@/features/game/logic/typing/shared";
import {AutoClosingMode} from "@/features/settings/types/autoclosing-mode";
import {IParsedSnippet} from "@/shared/types/snippet";

export function deleteLine(snippet: IParsedSnippet, position: number, autoClosingMode: AutoClosingMode): [IParsedSnippet, number] {
  if (position === 0) return [snippet, 0];

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

  const updatedSnippet = resetCharactersInRange(snippet, newPos, position, autoClosingMode === AutoClosingMode.FULL);

  return [updatedSnippet, newPos];
}
