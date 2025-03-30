import Parser from "tree-sitter";
import {Language} from "@/constants/supported-languages";
import JavaScript from "tree-sitter-javascript";

// @ts-expect-error tree-sitter packages have no types
import TypeScript from "tree-sitter-typescript/typescript";
// @ts-expect-error tree-sitter packages have no types
import C from "tree-sitter-c";
// @ts-expect-error tree-sitter packages have no types
import Cpp from "tree-sitter-cpp";
import CSharp from "tree-sitter-c-sharp";
import Java from "tree-sitter-java";
// @ts-expect-error tree-sitter packages have no types
import Python from "tree-sitter-python";
// @ts-expect-error tree-sitter packages have no types
import Lua from "tree-sitter-lua";
import {convertLanguage} from "tree-sitter-compat";

export function getTSParser(language: Language): Parser {
  const parser = new Parser();

  const languageName = getLanguage(language);

  parser.setLanguage(convertLanguage(languageName));

  return parser;
}

function getLanguage(language: Language) {
  switch (language) {
    case Language.JAVASCRIPT:
      return JavaScript;
    case Language.TYPESCRIPT:
      return TypeScript;
    case Language.C:
      return C;
    case Language.CPP:
      return Cpp;
    case Language.CSHARP:
      return CSharp;
    case Language.JAVA:
      return Java;
    case Language.PYTHON:
      return Python;
    case Language.LUA:
      return Lua;
    default:
      throw new Error(`Language ${language} not supported.`);
  }
}
