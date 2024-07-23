import { ICodeLanguage, LanguageName } from "@/types/CodeLanguage";

export const MAX_LINES = 11;
export const MIN_LINES = 3;

export const MAX_LINE_LENGTH = 72;

export const MAX_SNIPPET_LENGTH = 300;
export const MIN_SNIPPET_LENGTH = 100;

export const VALID_NODES = [
  "function_declaration",
  "function_definition",
  "class_declaration",
  "class_definition",
  "function_item",
  "method_declaration",
  "method_definition",
  "method_item",
  "class_item",
  "interface_declaration",
  "interface_definition",
  "interface_item",
  "module",
  "switch_statement",
  // "if_statement",
  // "while_statement",
  // "for_statement"
];

export const MIN_CACHED_SNIPPETS = 10;
export const SNIPPETS_SIMULTANEOUS_REQUESTS = 5;

export const SUPPORTED_LANGUAGES: Record<LanguageName, ICodeLanguage> = {
  [LanguageName.JavaScript]: {
    name: LanguageName.JavaScript,
    extensions: ["js", "jsx"],
    hasScopeTerminators: true,
    treeSitterFile: "tree-sitter-javascript.wasm",
    highlightAlias: "javascript"
  },
  [LanguageName.TypeScript]: {
    name: LanguageName.TypeScript,
    extensions: ["ts", "tsx"],
    hasScopeTerminators: true,
    treeSitterFile: "tree-sitter-typescript.wasm",
    highlightAlias: "typescript"
  },
  [LanguageName.C]: {
    name: LanguageName.C,
    extensions: ["c"],
    hasScopeTerminators: true,
    treeSitterFile: "tree-sitter-c.wasm",
    highlightAlias: "cpp"
  },
  [LanguageName.Cpp]: {
    name: LanguageName.Cpp,
    extensions: ["cpp"],
    hasScopeTerminators: true,
    treeSitterFile: "tree-sitter-cpp.wasm",
    highlightAlias: "cpp"
  },
  [LanguageName.CSharp]: {
    name: LanguageName.CSharp,
    extensions: ["cs"],
    hasScopeTerminators: true,
    treeSitterFile: "tree-sitter-c_sharp.wasm",
    highlightAlias: "csharp"
  },
  [LanguageName.Java]: {
    name: LanguageName.Java,
    extensions: ["java"],
    hasScopeTerminators: true,
    treeSitterFile: "tree-sitter-java.wasm",
    highlightAlias: "java"
  },
  [LanguageName.Python]: {
    name: LanguageName.Python,
    extensions: ["py"],
    hasScopeTerminators: true,
    treeSitterFile: "tree-sitter-python.wasm",
    highlightAlias: "python"
  },
  [LanguageName.Lua]: {
    name: LanguageName.Lua,
    extensions: ["lua"],
    hasScopeTerminators: true,
    treeSitterFile: "tree-sitter-lua.wasm",
    highlightAlias: "lua"
  }
};