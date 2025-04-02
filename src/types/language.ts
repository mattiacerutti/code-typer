import {Language} from "@/constants/supported-languages";

export enum LanguageId{
  JAVASCRIPT = "js",
  TYPESCRIPT = "ts",
  C = "c",
  CPP = "cpp",
  CSHARP = "cs",
  JAVA = "java",
  PYTHON = "py",
  LUA = "lua",
}

export interface ILanguage {
  id: LanguageId;
  name: Language;
  extensions: string[];
  highlightAlias: string;
}
