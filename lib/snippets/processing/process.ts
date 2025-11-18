import {adjustIndentationOffset, applyIndentationToEmptyLines, detectIndentationStyle} from "./indentation";
import {countInitialWhitespaces} from "./utils";

function cleanText(text: string): string {
  // Remove whitespaces from empty lines
  text = text.replace(/(?<=\n)[ \t]+(?=\n)/g, "");

  return text;
}

function hasProhibitedCharacters(input: string): boolean {
  const regex = /((?:(?![ \t\n])\s)|\\)/;
  return regex.test(input);
}

export function formatCode(snippet: string): string | null {
  if (hasProhibitedCharacters(snippet)) {
    return null;
  }

  // Clean raw snippet
  snippet = cleanText(snippet);

  const indentationStyle = detectIndentationStyle(snippet);

  if (indentationStyle.type === "mixed") {
    return null;
  }

  if (indentationStyle.type === "none") {
    return snippet;
  }

  // Convert raw snippet indentation style with standardized '\t' indentation
  let codeLines = snippet.split("\n").map((line) => {
    const initialWhitespaces = countInitialWhitespaces(line);

    const trimmedLine = line.trim();

    if (indentationStyle.type === "space") {
      return "\t".repeat(indentationStyle.value.indexOf(initialWhitespaces)) + trimmedLine;
    }

    return "\t".repeat(initialWhitespaces) + trimmedLine;
  });

  // Adjust indentation offset on every line
  codeLines = adjustIndentationOffset(codeLines);

  // Applies indentation to empty lines (the minimum indentation of the surrounding lines)
  codeLines = applyIndentationToEmptyLines(codeLines);

  return codeLines.join("\n");
}
