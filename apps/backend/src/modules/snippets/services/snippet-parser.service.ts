import { Injectable } from '@nestjs/common';
import * as Parser from 'tree-sitter';
import { LanguageName } from '@lib/types/CodeLanguage';

import * as JavaScript from 'tree-sitter-javascript';
import * as TypeScript from 'tree-sitter-typescript/typescript';
import * as C from 'tree-sitter-c';
import * as Cpp from 'tree-sitter-cpp';
import * as CSharp from 'tree-sitter-c-sharp';
import * as Java from 'tree-sitter-java';
import * as Python from 'tree-sitter-python';
import * as Lua from 'tree-sitter-lua';
import { convertLanguage } from 'tree-sitter-compat';

@Injectable()
export class SnippetParseService {
  getTSParser = (language: LanguageName): Parser => {
    const parser = new Parser();

    const languageName = this.getLanguage(language);

    parser.setLanguage(convertLanguage(languageName));

    return parser;
  };

  private getLanguage(language: LanguageName) {
    switch (language) {
      case LanguageName.JavaScript:
        return JavaScript;
      case LanguageName.TypeScript:
        return TypeScript;
      case LanguageName.C:
        return C;
      case LanguageName.Cpp:
        return Cpp;
      case LanguageName.CSharp:
        return CSharp;
      case LanguageName.Java:
        return Java;
      case LanguageName.Python:
        return Python;
      case LanguageName.Lua:
        return Lua;
      default:
        throw new Error(`Language ${language} not supported.`);
    }
  }
}
