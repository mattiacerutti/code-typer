import { ICodeLanguage, LanguageName } from '../types/CodeLanguage';
import {SUPPORTED_LANGUAGES} from '../constants/code-languages.constant';

export function getSupportedLanguage(language: LanguageName): ICodeLanguage {
  if (!SUPPORTED_LANGUAGES[language]) {
    throw `Language ${language} not supported.`;
  }
  return SUPPORTED_LANGUAGES[language];
}
