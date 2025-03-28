import Parser from "tree-sitter";
import {Language} from "@/constants/supported-languages";
import * as JavaScript from 'tree-sitter-javascript';
import * as TypeScript from 'tree-sitter-typescript/typescript';
import * as C from 'tree-sitter-c';
import * as Cpp from 'tree-sitter-cpp';
import * as CSharp from 'tree-sitter-c-sharp';
import * as Java from 'tree-sitter-java';
import * as Python from 'tree-sitter-python';
import * as Lua from 'tree-sitter-lua';
import { convertLanguage } from 'tree-sitter-compat';

// import {convertLanguage} from "tree-sitter-compat";

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
