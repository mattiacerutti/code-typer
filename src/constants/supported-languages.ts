import {ILanguage, LanguageId} from "@/types/language";


export const SUPPORTED_LANGUAGES: Record<LanguageId, ILanguage> = {
  [LanguageId.JAVASCRIPT]: {
    id: LanguageId.JAVASCRIPT,
    name: "JavaScript",
    extensions: ["js", "jsx"],
    highlightAlias: "javascript",
  },
  [LanguageId.TYPESCRIPT]: {
    id: LanguageId.TYPESCRIPT,
    name: "TypeScript",
    extensions: ["ts", "tsx"],
    highlightAlias: "typescript",
  },
  [LanguageId.C]: {
    id: LanguageId.C,
    name: "C",
    extensions: ["c"],
    highlightAlias: "c",
  },
  [LanguageId.CPP]: {
    id: LanguageId.CPP,
    name: "C++",
    extensions: ["cpp"],
    highlightAlias: "cpp",
  },
  [LanguageId.CSHARP]: {
    id: LanguageId.CSHARP,
    name: "C#",
    extensions: ["cs"],
    highlightAlias: "csharp",
  },
  [LanguageId.JAVA]: {
    id: LanguageId.JAVA,
    name: "Java",
    extensions: ["java"],
    highlightAlias: "java",
  },
  [LanguageId.PYTHON]: {
    id: LanguageId.PYTHON,
    name: "Python",
    extensions: ["py"],
    highlightAlias: "python",
  },
  [LanguageId.LUA]: {
    id: LanguageId.LUA,
    name: "Lua",
    extensions: ["lua"],
    highlightAlias: "lua",
  },
};
