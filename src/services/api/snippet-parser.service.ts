import Parser from "tree-sitter";
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
import { LanguageId } from "@/types/language";

export function getTSParser(languageId: LanguageId): Parser {
  const parser = new Parser();

  const languageName = getLanguage(languageId);

  parser.setLanguage(convertLanguage(languageName));

  return parser;
}

function getLanguage(languageId: LanguageId) {
  switch (languageId) {
    case LanguageId.JAVASCRIPT:
      return JavaScript;
    case LanguageId.TYPESCRIPT:
      return TypeScript;
    case LanguageId.C:
      return C;
    case LanguageId.CPP:
      return Cpp;
    case LanguageId.CSHARP:
      return CSharp;
    case LanguageId.JAVA:
      return Java;
    case LanguageId.PYTHON:
      return Python;
    case LanguageId.LUA:
      return Lua;
    default:
      throw new Error(`Language ${languageId} not supported.`);
  }
}
