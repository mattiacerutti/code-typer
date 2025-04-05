import {adjustIndentationOffset, detectIndentationStyle} from "@/lib/server/snippets/indentation";
import { extractSnippets } from "@/lib/server/snippets/snippet-parser";
import {countInitialWhitespaces} from "@/utils/server/text";
import {filterLineLength, filterLinesNumber, filterSnippetLength, filterSnippetSpecialCharacters, filterTabsInBetween} from "@/utils/server/snippet-filters";


function filterSnippets(snippets: string[]): string[] {
  return snippets
    .filter((snippet) => filterSnippetLength(snippet))
    .filter((snippet) => filterLinesNumber(snippet))
    .filter((snippet) => filterLineLength(snippet))
    .filter((snippet) => filterSnippetSpecialCharacters(snippet))
    .filter((snippet) => filterTabsInBetween(snippet));
}


function cleanText(text: string): string {
  // Cleans text from invalid whitespaces and whitespaces out of place
  return text.replace(/[^\S\t\n ]/g, "").replace(/(?<=\n)[ \t]+(?=\n)/g, "");
}

function formatCode(snippet: string): string | null {
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

  // Adjust indentation offset
  codeLines = adjustIndentationOffset(codeLines);

  return codeLines.join("\n");
}


export function processSnippets(fileContent: string, languageId: string): string[] {
  const extractedSnippets = extractSnippets(fileContent, languageId);

  const formattedSnippets = extractedSnippets.map((snippet) => formatCode(snippet)).filter((snippet) => snippet !== null);

  const filteredSnippets = filterSnippets(formattedSnippets);

  return filteredSnippets;
}
