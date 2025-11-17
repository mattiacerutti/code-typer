import {extractSnippets} from "./parsing/parser";
import {filterSnippets} from "./processing/filter";
import {formatCode} from "./processing/process";
import {hashSnippet} from "./processing/utils";

interface ISnippetOutput {
  sha: string;
  content: string;
  rawContent: string;
}

export function getSnippetsFromFile(fileContent: string, languageId: string): ISnippetOutput[] {
  const extractedSnippets = extractSnippets(fileContent, languageId);

  const formattedSnippets = extractedSnippets
    .map((snippet) => ({
      sha: hashSnippet(snippet),
      content: formatCode(snippet),
      rawContent: snippet,
    }))
    .filter((s) => s.content !== null) as ISnippetOutput[];

  const filteredSnippets = formattedSnippets.filter((snippet) => filterSnippets(snippet.content));

  return filteredSnippets;
}
