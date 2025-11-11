import {countInitialWhitespaces, removeInitialCharacters} from "./text.server";

type IIndentationStyle = {type: "none" | "mixed" | "tab"} | {type: "space"; value: number[]};
export function detectIndentationStyle(snippet: string): IIndentationStyle {
  const lines = snippet.split("\n");

  let tabCount = 0;
  const spacesCount: {[key: number]: number} = {};

  for (const line of lines) {
    const leadingWhitespaces = line.match(/^\s*/)?.[0];

    if (!leadingWhitespaces || leadingWhitespaces.length === 0) continue;

    if (leadingWhitespaces.includes("\t")) {
      if (leadingWhitespaces.includes(" ")) {
        return {type: "mixed"};
      }

      tabCount++;
      continue;
    }

    const numberOfSpaces = leadingWhitespaces.length;
    spacesCount[numberOfSpaces] = (spacesCount[numberOfSpaces] ?? 0) + 1;
  }

  const spaceKeys = Object.keys(spacesCount).map(Number);

  if (spaceKeys.length === 0 && tabCount === 0) {
    return {type: "none"};
  }

  if (spaceKeys.length > 0 && tabCount > 0) {
    return {type: "mixed"};
  }

  if (tabCount > 0) {
    return {type: "tab"};
  }

  spaceKeys.push(0);

  return {type: "space", value: spaceKeys.sort((a, b) => a - b)};
}

export function adjustIndentationOffset(lines: string[]): string[] {
  // Sometimes the code has an indentation offset on every line. We can remove that offset by removing the number of initial whitespaces in the first line from every line (this is because the first line should never be indented).
  const indentationOffset = countInitialWhitespaces(lines[0]);

  return removeInitialCharacters(lines, indentationOffset);
}

export function getInitialIndentation(nodeStartIndex: number, sourceCode: string): string {
  let startingPoint = nodeStartIndex - 1;

  let buf: string = "";

  while (sourceCode[startingPoint] !== "\n" && startingPoint >= 0) {
    if (sourceCode[startingPoint] !== " " && sourceCode[startingPoint] !== "\t") {
      buf = "";
      startingPoint--;
      continue;
    }

    buf += sourceCode[startingPoint];
    startingPoint--;
  }

  return buf;
}

export function applyIndentationToEmptyLines(lines: string[]): string[] {
  return lines
    .map((line, index) => {
      if (line !== "") {
        return line;
      }

      if (index === 0 || index === lines.length - 1) {
        return null;
      }

      const previousLineInitialWhitespaces = countInitialWhitespaces(lines[index - 1]);
      const nextLineInitialWhitespaces = countInitialWhitespaces(lines[index + 1]);

      // If increasing indentation, we apply the bigger one
      if (previousLineInitialWhitespaces < nextLineInitialWhitespaces) {
        return "\t".repeat(nextLineInitialWhitespaces);
      }

      // If decreasing indentation or same, we apply the smaller one
      return "\t".repeat(Math.min(previousLineInitialWhitespaces, nextLineInitialWhitespaces));
    })
    .filter((line) => line !== null);
}
