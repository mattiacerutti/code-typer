import {Language} from "@/constants/supported-languages";

export interface ILanguage {
  name: Language;
  extensions: string[];
  highlightAlias: string;
}
