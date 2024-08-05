import { LanguageName } from "@lib/types/CodeLanguage";


export const AUTO_CLOSING_CHARS: {[key: string]: string} = {
  "(": ")",
  "[": "]",
  "{": "}",
  "`": "`",
  '"': '"',
  "'": "'",
}

export const DEFAULT_LANGUAGE = LanguageName.TypeScript;
export const REFRESH_BUTTON_MIN_DELAY = 1000;

export const SHOULD_PRESERVE_CLOSING_CHAR_WHEN_DELETING = true;


