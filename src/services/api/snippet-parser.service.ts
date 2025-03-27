import Parser from "tree-sitter";
import {Languages} from "@/constants/supported-languages";
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

export function getTSParser(language: Languages): Parser {
  const parser = new Parser();

  const languageName = getLanguage(language);

  parser.setLanguage(convertLanguage(languageName));

  return parser;
}

function getLanguage(language: Languages) {
  switch (language) {
    case Languages.JAVASCRIPT:
      return JavaScript;
    case Languages.TYPESCRIPT:
      return TypeScript;
    case Languages.C:
      return C;
    case Languages.CPP:
      return Cpp;
    case Languages.CSHARP:
      return CSharp;
    case Languages.JAVA:
      return Java;
    case Languages.PYTHON:
      return Python;
    case Languages.LUA:
      return Lua;
    default:
      throw new Error(`Language ${language} not supported.`);
  }
}
