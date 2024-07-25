import * as constants from "@/utils/constants";
import IParser from "web-tree-sitter";
import { usesScopeTerminators } from "./snippet-utils";
import { LanguageName } from "@/types/CodeLanguage";

export function filterLinesNumber(snippet: string): boolean {
  const numLines = snippet.split("\n").length;
  return numLines <= constants.MAX_LINES && numLines >= constants.MIN_LINES;
}

export function filterLineLength(snippet: string): boolean {
  const lines = snippet.split("\n");
  return lines.every((line) => line.trim().length <= constants.MAX_LINE_LENGTH);
}

export function filterSnippetLength(snippet: string): boolean {
  return snippet.length >= constants.MIN_SNIPPET_LENGTH && snippet.length <= constants.MAX_SNIPPET_LENGTH;
}

export function filterSnippetSpecialCharacters(snippet: string): boolean {
  // eslint-disable-next-line no-control-regex
  const regex = /^[\x00-\x7F]+$/;
  const test = regex.test(snippet);

  return test;
}

export function isValidNode(node: IParser.SyntaxNode, language: LanguageName) {

  const nodesWithOptionalClosing = ["while_statement", "for_statement"];

  // We need to check that there actually is a scope closer
  if(nodesWithOptionalClosing.includes(node.type)) {
    if(usesScopeTerminators(language)) {
      return node.lastChild?.lastChild?.type === "}" || node.lastChild?.type === "end";
    }
    return true;
  }

  return constants.VALID_NODES.includes(node.type);
}
