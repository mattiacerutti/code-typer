import {CharacterTypes, WhitespaceTypes} from "@/shared/types/character";
import {IParsedSnippet} from "@/shared/types/snippet";

export function calculateWPM(milliseconds: number, totalCharacters: number) {
  const minutes = milliseconds / 1000 / 60;
  const wpm = totalCharacters / 5 / minutes;
  return Math.round(wpm);
}

export function calculateAccuracy(validKeystrokes: number, wrongKeystrokes: number) {
  const accuracy = (validKeystrokes / (validKeystrokes + wrongKeystrokes)) * 100;
  return Math.round(accuracy);
}

export function humanizeTime(milliseconds: number) {
  const seconds = (milliseconds / 1000).toFixed(1);
  return `${seconds}s`;
}

export function normalizePositionSamples(positionSamples: {time: number; position: number}[], snippet: IParsedSnippet) {
  function isValidCharacter(index: number) {
    const char = snippet[index];

    if (!char) return false;
    if (char.type === CharacterTypes.EOF) return false;
    if (char.type === CharacterTypes.AutoClosing && !char.isOpening) return false;

    // Filter out tabs or lines or empty lines
    if (char.type === CharacterTypes.Whitespace) {
      if (char.value === WhitespaceTypes.Tab) return false;
      const prev = snippet[index - 1];
      if (char.value === WhitespaceTypes.NewLine && prev.type === CharacterTypes.Whitespace && prev.value === WhitespaceTypes.NewLine) return false;
    }

    return true;
  }

  const falsePrefix = new Array(snippet.length).fill(0);
  falsePrefix[0] = isValidCharacter(0) ? 0 : 1;

  for (let i = 1; i < snippet.length; i++) {
    falsePrefix[i] = falsePrefix[i - 1] + (isValidCharacter(i) ? 0 : 1);
  }

  return positionSamples.map((sample) => ({
    ...sample,
    position: sample.position - falsePrefix[sample.position],
  }));
}
