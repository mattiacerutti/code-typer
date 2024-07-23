import * as constants from "@/utils/constants";

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

export function isValidNode(nodeType: string) {
  return constants.VALID_NODES.includes(nodeType);
}
