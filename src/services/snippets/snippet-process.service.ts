import {getTSParser} from "../ts-parser.service";
import IParser from "web-tree-sitter";
import {filterLineLength, filterLinesNumber, filterSnippetLength, filterSnippetSpecialCharacters, isValidNode} from "@/utils/snippets/snippet-filters";
import {
  detectIndentationStyle,
  countInitialWhitespaces,
  usesScopeTerminators,
  getNodeText,
  removeInvalidWhitespaces,
  adjustFinalLineWhitespaces,
} from "@/utils/snippets/snippet-utils";
import {LanguageName} from "@/types/CodeLanguage";

function findValidNodes(node: IParser.SyntaxNode): IParser.SyntaxNode[] {
  let nodes: IParser.SyntaxNode[] = [];
  if (isValidNode(node.type)) {
    nodes.push(node);
  }

  node.children.forEach((child) => {
    if (child === null) return;
    nodes = nodes.concat(findValidNodes(child));
  });

  return nodes;
}

export async function extractSnippets(fileContent: string, language: LanguageName): Promise<string[]> {
  const parser = await getTSParser(language);

  let parsedCode: IParser.Tree;
  
  try {
    parsedCode = parser.parse(fileContent);
  } catch (error) {
    console.error("Error parsing code:", error);
    return [];
  }

  const validNodes = findValidNodes(parsedCode.rootNode);
  const validSnippets: string[] = validNodes.map((node) => getNodeText(node));

  return validSnippets;
}

export function filterSnippets(snippets: string[]): string[] {
  return snippets
    .filter((snippet) => filterSnippetLength(snippet))
    .filter((snippet) => filterLinesNumber(snippet))
    .filter((snippet) => filterLineLength(snippet))
    .filter((snippet) => filterSnippetSpecialCharacters(snippet));
}

export function formatCode(code: string, language: string): string | null {
  code = removeInvalidWhitespaces(code);

  const indentationStyle = detectIndentationStyle(code);
  console.log("Detected indentation style:", indentationStyle);

  switch (indentationStyle.type) {
    case "mixed":
      console.error("Mixed indentation is not supported");
      return null;
    case "none":
      return code;
    case "space":
      indentationStyle.value.unshift(0);
      indentationStyle.value.sort((a, b) => a - b);
      break;
  }

  let codeLines = code.split("\n").map((line) => {
    const initialWhitespaces = countInitialWhitespaces(line);

    line = line.trim();

    if (!indentationStyle.value) {
      return "\t".repeat(initialWhitespaces) + line;
    }

    return "\t".repeat(indentationStyle.value.indexOf(initialWhitespaces)) + line;
  });

  /* We need to do this because in languages where a scope end with something like "}", 
  the final line is commonly bad indented (like when you copy a piece of code) */

  if (usesScopeTerminators(language)) {
    codeLines = adjustFinalLineWhitespaces(codeLines);
  }

  return codeLines.join("\n");
}
