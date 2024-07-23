import Parser from "web-tree-sitter";
import { LanguageName } from "@/types/CodeLanguage";
import { getSupportedLanguage } from "@/utils/snippets/snippet-utils";

let parser: Parser | null = null;

export const getTSParser = async (language: LanguageName): Promise<Parser> => {
  if (!parser) {
    await Parser.init({
      locateFile(scriptName: string) {
        return `wasm/${scriptName}`;
      },
    });
    parser = new Parser();
  }

  const languageWasm = await Parser.Language.load(`wasm/${getSupportedLanguage(language).treeSitterFile}`);
  parser.setLanguage(languageWasm);

  return parser;
};