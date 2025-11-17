import {getInitialIndentation} from "@lib/snippets/processing/indentation";
import {getTSParser} from "./parser-factory";
import IParser from "tree-sitter";
import {isValidNode} from "@lib/snippets/processing/filter";

export function findValidNodes(node: IParser.SyntaxNode): IParser.SyntaxNode[] {
  let nodes: IParser.SyntaxNode[] = [];
  if (isValidNode(node)) {
    nodes.push(node);
  }

  node.children.forEach((child) => {
    if (child === null) return;
    nodes = nodes.concat(findValidNodes(child));
  });

  return nodes;
}

export function convertSnippetToText(node: IParser.SyntaxNode, sourceCode: string): string {
  const initialIndentation = getInitialIndentation(node.startIndex, sourceCode);

  return initialIndentation + getNodeText(node);
}

export function extractSnippets(fileContent: string, languageId: string): string[] {
  const parser = getTSParser(languageId);

  let parsedCode: IParser.Tree;

  try {
    parsedCode = parser.parse(fileContent);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return [];
  }

  const validNodes = findValidNodes(parsedCode.rootNode);
  const validSnippets = validNodes.map((node) => convertSnippetToText(node, fileContent));

  return validSnippets;
}

export function getNodeText(node: IParser.SyntaxNode): string {
  return node.text;
}
