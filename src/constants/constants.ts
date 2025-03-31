import { Language } from "@/constants/supported-languages";


export const AUTO_CLOSING_CHARS: {[key: string]: string} = {
  "(": ")",
  "[": "]",
  "{": "}",
  "`": "`",
  '"': '"',
  "'": "'",
}

export const DEFAULT_LANGUAGE = Language.JAVASCRIPT;
export const REFRESH_BUTTON_MIN_DELAY = 1000;

export const SHOULD_PRESERVE_CLOSING_CHAR_WHEN_DELETING = true;


