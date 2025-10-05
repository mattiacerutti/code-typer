import {adjustIndentationOffset, detectIndentationStyle} from "./indentation.server";
import { extractAutoCompleteDisabledRanges, extractSnippets } from "@/features/snippets/logic/parsing/snippet-parser.server";
import {countInitialWhitespaces} from "./text.server";
import {filterLineLength, filterLinesNumber, filterSnippetLength, filterSnippetSpecialCharacters, filterTabsInBetween} from "./snippet-filters.server";
import { ISnippet } from "@/shared/types/snippet.server";


function filterSnippets(snippets: string[]): string[] {
  return snippets
    .filter((snippet) => filterSnippetLength(snippet))
    .filter((snippet) => filterLinesNumber(snippet))
    .filter((snippet) => filterLineLength(snippet))
    .filter((snippet) => filterSnippetSpecialCharacters(snippet))
    .filter((snippet) => filterTabsInBetween(snippet));
}


function cleanText(text: string): string {

  // Remove whitespaces from empty lines
  text = text.replace(/(?<=\n)[ \t]+(?=\n)/g, "");

  return text;
}


function hasProhibitedCharacters(input: string): boolean {
  const regex = /((?:(?![ \t\n])\s)|\\)/;
  return regex.test(input);
}

function formatCode(snippet: string): string | null {
  
  if(hasProhibitedCharacters(snippet)){
    return null;
  }
  
  // Clean raw snippet
  snippet = cleanText(snippet)

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


export function processSnippets(fileContent: string, languageId: string): ISnippet[] {
  const extractedSnippets = extractSnippets(fileContent, languageId);


  const formattedSnippets = extractedSnippets.map((snippet) => formatCode(snippet)).filter((snippet) => snippet !== null);


  const filteredSnippets = filterSnippets(formattedSnippets);

  
  const finalSnippets = filteredSnippets.map((snippet) => {
    const disabledRanges = extractAutoCompleteDisabledRanges(snippet, languageId);


    return {
      content: snippet,
      disabledRanges,
    };
  });


  return finalSnippets;
}



