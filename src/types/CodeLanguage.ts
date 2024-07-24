export enum LanguageName {
  JavaScript = "JavaScript",
  TypeScript = "TypeScript",
  C = "C",
  Cpp = "C++",
  CSharp = "C#",
  Java = "Java",
  Python = "Python",
  Lua = "Lua",
}

export interface ICodeLanguage {
  name: LanguageName;
  extensions: string[];
  hasScopeTerminators: boolean;
  treeSitterFile: string;
  highlightAlias: string;
}
