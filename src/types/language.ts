import { Languages } from "@/constants/supported-languages";

export interface ILanguage {
  name: Languages;
  extensions: string[];
  highlightAlias: string;
}
