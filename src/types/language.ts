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
  name: string;
  extensions: string[];
  highlightAlias: string;
}
