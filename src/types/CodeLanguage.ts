export enum LanguageName {
  JavaScript = "javascript",
  TypeScript = "typescript",
  C = "c",
  Cpp = "cpp",
  CSharp = "csharp",
  Java = "java",
  Python = "python",
  Lua = "lua",
}

export interface ICodeLanguage {
  name: LanguageName;
  extensions: string[];
  hasScopeTerminators: boolean;
  treeSitterFile: string;
  highlightAlias: string;
}
