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
  "while_statement",
  "for_statement",
  "if_statement"
];

export const MIN_CACHED_SNIPPETS = 10;
export const SNIPPETS_SIMULTANEOUS_REQUESTS = 10;

export const SUPPORTED_LANGUAGES: Record<LanguageName, ICodeLanguage> = {
  [LanguageName.JavaScript]: {
    name: LanguageName.JavaScript,
    extensions: ["js", "jsx"],
    treeSitterFile: "tree-sitter-javascript.wasm",
    highlightAlias: "javascript"
  },
  [LanguageName.TypeScript]: {
    name: LanguageName.TypeScript,
    extensions: ["ts", "tsx"],
    treeSitterFile: "tree-sitter-typescript.wasm",
    highlightAlias: "typescript"
  },
  [LanguageName.C]: {
    name: LanguageName.C,
    extensions: ["c"],
    treeSitterFile: "tree-sitter-c.wasm",
    highlightAlias: "cpp"
  },
  [LanguageName.Cpp]: {
    name: LanguageName.Cpp,
    extensions: ["cpp"],
    treeSitterFile: "tree-sitter-cpp.wasm",
    highlightAlias: "cpp"
  },
  [LanguageName.CSharp]: {
    name: LanguageName.CSharp,
    extensions: ["cs"],
    treeSitterFile: "tree-sitter-c_sharp.wasm",
    highlightAlias: "csharp"
  },
  [LanguageName.Java]: {
    name: LanguageName.Java,
    extensions: ["java"],
    treeSitterFile: "tree-sitter-java.wasm",
    highlightAlias: "java"
  },
  [LanguageName.Python]: {
    name: LanguageName.Python,
    extensions: ["py"],
    treeSitterFile: "tree-sitter-python.wasm",
    highlightAlias: "python"
  },
  [LanguageName.Lua]: {
    name: LanguageName.Lua,
    extensions: ["lua"],
    treeSitterFile: "tree-sitter-lua.wasm",
    highlightAlias: "lua"
  }
};

export const DEFAULT_LANGUAGE = LanguageName.TypeScript;
export const REFRESH_BUTTON_MIN_DELAY = 1000;

export const SHOULD_PRESERVE_CLOSING_CHAR_WHEN_DELETING = true;
