import {getTSParser} from "./parser-factory.server";
import {getInitialIndentation} from "@/features/snippets/logic/processing/indentation.server";
import {isValidNode} from "@/features/snippets/logic/processing/snippet-filters.server";
import IParser from "tree-sitter";

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

export function extractAutoCompleteDisabledRanges(fileContent: string, languageId: string): {startIndex: number; endIndex: number}[] {
  const parser = getTSParser(languageId);

  let parsedCode: IParser.Tree;

  try {
    parsedCode = parser.parse(fileContent);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return [];
  }

  const ranges: {startIndex: number; endIndex: number}[] = [];
  const queue: IParser.SyntaxNode[] = [parsedCode.rootNode];

  while (queue.length > 0) {
    const current = queue.pop();
    if (!current) continue;

    if (current.type === "string" || current.type === "string_literal" || current.type === "comment") {
      if (current.type === "comment") {
        ranges.push({
          startIndex: current.startIndex,
          endIndex: current.endIndex,
        });
      } else {
        const actualStartIndex = current.startIndex + 1;
        const actualEndIndex = current.endIndex - 2;

        if (actualStartIndex < actualEndIndex) {
          ranges.push({
            startIndex: actualStartIndex,
            endIndex: actualEndIndex,
          });
        }
      }
    }

    for (let i = 0; i < current.namedChildCount; i++) {
      const child = current.namedChild(i);
      if (child) {
        queue.push(child);
      }
    }
  }

  return ranges;
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
