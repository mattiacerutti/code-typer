import {getLineStart, getPreviousLineEnd, isFirstCharacter, resetCharactersInRange} from "@/features/game/logic/typing/shared";
import {AutoClosingMode} from "@/features/settings/types/autoclosing-mode";
import {IParsedSnippet} from "@/shared/types/snippet";

export function deleteLine(snippet: IParsedSnippet, position: number, autoClosingMode: AutoClosingMode): [IParsedSnippet, number] {
  if (position === 0) return [snippet, 0];

  let newPos = getLineStart(snippet, position);

  if (isFirstCharacter(snippet, position)) {
    let previousLineEnd = getPreviousLineEnd(snippet, position);

    // If the last char and first char of the previous line are the same, we are in an empty line
    while (previousLineEnd && getLineStart(snippet, previousLineEnd) === previousLineEnd && autoClosingMode === AutoClosingMode.FULL) {
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
