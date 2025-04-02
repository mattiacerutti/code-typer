import {SUPPORTED_LANGUAGES} from "@/constants/supported-languages";
import {CharacterState, CharacterTypes, WhitespaceTypes} from "@/types/character";
import {ILanguage, LanguageId} from "@/types/language";
import { ISnippet } from "@/types/snippet";

export function isGameFinished(parsedSnippets: ISnippet) {
  const allCorrect = parsedSnippets.every(
    (char) =>
      char.state === CharacterState.Right ||
      char.value === WhitespaceTypes.Tab ||
      (char.value === WhitespaceTypes.NewLine && char.state === CharacterState.Default) ||
      char.type === CharacterTypes.EOF
  );

  return allCorrect;
}

export function calculateWPM(milliseconds: number, totalCharacters: number) {
  const minutes = milliseconds / 1000 / 60;
  const wpm = totalCharacters / 5 / minutes;
  return Math.round(wpm);
}

export function calculateAccuracy(validKeystrokes: number, wrongKeystrokes: number) {
  const accuracy = ((validKeystrokes - wrongKeystrokes) / validKeystrokes) * 100;
  return Math.round(accuracy);
}

export function humanizeTime(milliseconds: number) {
  const seconds = (milliseconds / 1000).toFixed(1);
  return `${seconds}s`;
}

export function getSupportedLanguage(languageId: LanguageId): ILanguage {
  if (!SUPPORTED_LANGUAGES[languageId]) {
    throw `Language ${languageId} not supported.`;
  }
  return SUPPORTED_LANGUAGES[languageId];
}
