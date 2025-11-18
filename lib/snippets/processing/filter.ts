import IParser from "tree-sitter";
import {MAX_LINE_LENGTH, MAX_LINES, MAX_SNIPPET_LENGTH, MIN_LINES, MIN_SNIPPET_LENGTH, VALID_NODES} from "../config";

function filterLinesNumber(snippet: string): boolean {
  const numLines = snippet.split("\n").length;
  return numLines <= MAX_LINES && numLines >= MIN_LINES;
}

function filterLineLength(snippet: string): boolean {
  const lines = snippet.split("\n");
  return lines.every((line) => line.trim().length <= MAX_LINE_LENGTH);
}

function filterSnippetLength(snippet: string): boolean {
  return snippet.length >= MIN_SNIPPET_LENGTH && snippet.length <= MAX_SNIPPET_LENGTH;
}

function filterSnippetSpecialCharacters(snippet: string): boolean {
  const regex = /^[\x00-\x7F]+$/;
  const test = regex.test(snippet);

  return test;
}

function filterTabsInBetween(snippet: string): boolean {
  const regex = /^.+\\t.+$/;
  return !regex.test(snippet);
}

export function isValidNode(node: IParser.SyntaxNode) {
  return VALID_NODES.includes(node.type);
}

export function filterSnippets(content: string): boolean {
  return filterSnippetLength(content) && filterLinesNumber(content) && filterLineLength(content) && filterSnippetSpecialCharacters(content) && filterTabsInBetween(content);
}
