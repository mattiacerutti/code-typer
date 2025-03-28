import { SUPPORTED_LANGUAGES } from "@/constants/supported-languages";
import {CharacterState, CharacterTypes, WhitespaceTypes} from "@/types/character";
import { Language } from "@/constants/supported-languages";
import { ILanguage } from "@/types/language";
import {ITextLine} from "@/types/text-line";

export function isGameFinished(lines: ITextLine[]) {
  const allCorrect = lines.every((line) => {
    return line.text.every(
      (char) =>
        char.state === CharacterState.Right ||
        (char.state === CharacterState.Default && char.value === WhitespaceTypes.NewLine) ||
        char.value === WhitespaceTypes.Tab ||
        char.type === CharacterTypes.EOF
    );
  });

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

export function getSupportedLanguage(language: Language): ILanguage {
  if (!SUPPORTED_LANGUAGES[language]) {
    throw `Language ${language} not supported.`;
  }
  return SUPPORTED_LANGUAGES[language];
}

