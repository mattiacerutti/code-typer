import {MAX_LINE_LENGTH, MAX_LINES, MAX_SNIPPET_LENGTH, MIN_LINES, MIN_SNIPPET_LENGTH, VALID_NODES} from "@/constants/api/snippets";
import IParser from "tree-sitter";

export function filterLinesNumber(snippet: string): boolean {
  const numLines = snippet.split("\n").length;
  return numLines <= MAX_LINES && numLines >= MIN_LINES;
}

export function filterLineLength(snippet: string): boolean {
  const lines = snippet.split("\n");
  return lines.every((line) => line.trim().length <= MAX_LINE_LENGTH);
}

export function filterSnippetLength(snippet: string): boolean {
  return snippet.length >= MIN_SNIPPET_LENGTH && snippet.length <= MAX_SNIPPET_LENGTH;
}

export function filterSnippetSpecialCharacters(snippet: string): boolean {
  const regex = /^[\x00-\x7F]+$/;
  const test = regex.test(snippet);

  return test;
}

export function filterTabsInBetween(snippet: string): boolean {
  const regex = /(^|[^\\])(\\t)|(\t)/;
  return regex.test(snippet.trim());
}

export function isValidNode(node: IParser.SyntaxNode) {
  return VALID_NODES.includes(node.type);
}
