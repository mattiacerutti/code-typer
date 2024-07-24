import { ICodeLanguage, LanguageName } from "@/types/CodeLanguage";
import * as constants from "@/utils/constants";
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
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ' || text[i] === '\t') {
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

  const secondLastLineWhitespaces = countInitialWhitespaces(lines[lines.length - 2]);

  const newLines: string[] = [lines[0]];

  const hasUniqueFinalLineIndentation = finalLineWhitespaces !== secondLastLineWhitespaces;

  newLines.push(...removeInitialWhitespaces(lines.slice(1), hasUniqueFinalLineIndentation ? Math.min(finalLineWhitespaces, secondLastLineWhitespaces) : finalLineWhitespaces - 1));

  return newLines;
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
  if(!constants.SUPPORTED_LANGUAGES[language]) {
    throw `Language ${language} not supported.`;
  }
  return constants.SUPPORTED_LANGUAGES[language];
}
