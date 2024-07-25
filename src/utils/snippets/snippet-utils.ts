import {ICodeLanguage, LanguageName} from "@/types/CodeLanguage";
import * as constants from "@/utils/constants";
import IParser from "web-tree-sitter";

type IIndentationStyle = {type: "none" | "mixed" | "tab"; value: null} | {type: "space"; value: number[]};

export function detectIndentationStyle(snippet: string): IIndentationStyle {
  const lines = snippet.split("\n");

  let tabCount = 0;
  const spaceCounts: {[key: number]: number} = {};

  for (const line of lines) {
    const leadingWhitespaces = line.match(/^\s*/);

    if(!leadingWhitespaces || leadingWhitespaces[0].length === 0) continue;

    if (leadingWhitespaces[0].includes("\t")) {
      if(leadingWhitespaces[0].includes(" ")) {
        return {type: "mixed", value: null};
      }

      tabCount++;
      continue;
    }

    const spaceCount = leadingWhitespaces[0].length;
    spaceCounts[spaceCount] = (spaceCounts[spaceCount] || 0) + 1;
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
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === " " || text[i] === "\t") {
      count++;
    } else {
      break;
    }
  }
  return count;
}

function removeInitialWhitespaces(lines: string[], quantity: number = 1): string[] {
  if (quantity < 1) return lines;

  const newLines: string[] = [];

  lines.forEach((line) => {
    newLines.push(line.slice(quantity));
  });

  return newLines;
}

export function getNodeText(node: IParser.SyntaxNode): string {
  return node.text;
}

export function removeInvalidWhitespaces(text: string): string {
  return text.replace(/[^\S\t\n ]/g, "");
}

export function adjustIndentationOffset(lines: string[]): string[] {
  // Sometimes the code has an indentation offset on every line. We can remove that offset by removing the number of initial whitespaces in the first line from every line (this is because the first line should never be indented).
  const indentationOffset = countInitialWhitespaces(lines[0]);

  return removeInitialWhitespaces(lines, indentationOffset);
}

export function getUniqueRandomIndexes(length: number, quantity: number): number[] {
  const indexes: number[] = Array.from({length: length}, (_, i) => i);

  if (quantity > length) return indexes;

  return Array.from({length: quantity}, () => {
    const randomIndex = Math.floor(Math.random() * indexes.length);
    const index = indexes[randomIndex];
    indexes.splice(randomIndex, 1);
    return index;
  });
}

export function getSupportedLanguage(language: LanguageName): ICodeLanguage {
  if (!constants.SUPPORTED_LANGUAGES[language]) {
    throw `Language ${language} not supported.`;
  }
  return constants.SUPPORTED_LANGUAGES[language];
}

