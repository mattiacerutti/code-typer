import IParser from "web-tree-sitter";

type IIndentationStyle = {type: "none" | "mixed" | "tab"; value: null} | {type: "space"; value: number[]};

export function detectIndentationStyle(snippet: string): IIndentationStyle {
  const lines = snippet.split("\n");

  let tabCount = 0;
  const spaceCounts: {[key: number]: number} = {};

  for (const line of lines) {
    const match = line.match(/^( +|\t+)/);

    if (match) {
      const indent = match[0];
      if (indent[0] === "\t") {
        tabCount++;
      } else {
        const spaceCount = indent.length;
        spaceCounts[spaceCount] = (spaceCounts[spaceCount] || 0) + 1;
      }
    }
  }

  const spaceKeys = Object.keys(spaceCounts).map(Number);

  if (spaceKeys.length === 0 && tabCount === 0) {
    return {type: "none", value: null};
  }

  if (spaceKeys.length > 0 && tabCount > 0) {
    return {type: "mixed", value: null};
  }

  if (tabCount > 0) {
    return {type: "tab", value: null};
  }

  return {type: "space", value: spaceKeys};
}

export function countInitialWhitespaces(text: string): number {
  const match = text.match(/^\s+/);
  if (match) {
    return match[0].length;
  }
  return 0;
}

function removeInitialWhitespaces(lines: string[], quantity: number = 1): string[] {
  if (quantity < 1) return lines;

  const newLines: string[] = [];

  lines.forEach((line) => {
    newLines.push(line.slice(quantity));
  });

  return newLines;
}

export function usesScopeTerminators(language: string): boolean {
  return language != "python";
}

export function getNodeText(node: IParser.SyntaxNode): string {
  return node.text;
}

export function removeInvalidWhitespaces(text: string): string {
  return text.replace(/[^\S\t\n ]/g, "");
}

export function adjustFinalLineWhitespaces(lines: string[]): string[] {
  // Since the last line should indentation depth equal to 0, we calculate the offset and subtract it through all the other lines
  const finalLineWhitespaces = countInitialWhitespaces(lines[lines.length - 1]);

  if (lines.length == 1) {
    removeInitialWhitespaces(lines, finalLineWhitespaces);
    return lines;
  }

  const newLines: string[] = [lines[0]];

  const hasUniqueFinalLineIndentation = finalLineWhitespaces !== countInitialWhitespaces(lines[lines.length - 2]);

  newLines.push(...removeInitialWhitespaces(lines.slice(1), hasUniqueFinalLineIndentation ? finalLineWhitespaces : finalLineWhitespaces - 1));

  return newLines;
}