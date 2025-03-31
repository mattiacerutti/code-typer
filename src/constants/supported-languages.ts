import {ILanguage} from "@/types/language";

export enum Language {
  JAVASCRIPT = "JavaScript",
  TYPESCRIPT = "TypeScript",
  C = "C",
  CPP = "C++",
  CSHARP = "C#",
  JAVA = "Java",
  PYTHON = "Python",
  LUA = "Lua",
}

export const SUPPORTED_LANGUAGES: Record<Language, ILanguage> = {
  [Language.JAVASCRIPT]: {
    name: Language.JAVASCRIPT,
    extensions: ["js", "jsx"],
    highlightAlias: "javascript",
  },
  [Language.TYPESCRIPT]: {
    name: Language.TYPESCRIPT,
    extensions: ["ts", "tsx"],
    highlightAlias: "typescript",
  },
  [Language.C]: {
    name: Language.C,
    extensions: ["c"],
    highlightAlias: "cpp",
  },
  [Language.CPP]: {
    name: Language.CPP,
    extensions: ["cpp"],
    highlightAlias: "cpp",
  },
  [Language.CSHARP]: {
    name: Language.CSHARP,
    extensions: ["cs"],
    highlightAlias: "csharp",
  },
  [Language.JAVA]: {
    name: Language.JAVA,
    extensions: ["java"],
    highlightAlias: "java",
  },
  [Language.PYTHON]: {
    name: Language.PYTHON,
    extensions: ["py"],
    highlightAlias: "python",
  },
  [Language.LUA]: {
    name: Language.LUA,
    extensions: ["lua"],
    highlightAlias: "lua",
  },
};
