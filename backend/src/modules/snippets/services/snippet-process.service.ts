import {
  filterLineLength,
  filterLinesNumber,
  filterSnippetLength,
  filterSnippetSpecialCharacters,
  filterTabsInBetween,
  isValidNode,
} from '@/common/utils/snippets/snippet-filters';
import {
  adjustIndentationOffset,
  countInitialWhitespaces,
  detectIndentationStyle,
  getNodeText,
  removeInvalidWhitespaces,
} from '@/common/utils/snippets/snippet-utils';
import { LanguageName } from '@/types/CodeLanguage';
import { Injectable } from '@nestjs/common';
import { SnippetParseService } from './snippet-parse.service';
import IParser from 'tree-sitter';

@Injectable()
export class SnippetProcessService {
  constructor(private readonly snippetParseService: SnippetParseService) {}

  private findValidNodes(node: IParser.SyntaxNode): IParser.SyntaxNode[] {
    let nodes: IParser.SyntaxNode[] = [];
    if (isValidNode(node)) {
      nodes.push(node);
    }

    node.children.forEach((child) => {
      if (child === null) return;
      nodes = nodes.concat(this.findValidNodes(child));
    });

    return nodes;
  }

  private getInitialIndentation(
    nodeStartIndex: number,
    sourceCode: string,
  ): string {
    let startingPoint = nodeStartIndex - 1;

    let buf: string = '';

    while (sourceCode[startingPoint] !== '\n' && startingPoint >= 0) {
      if (
        sourceCode[startingPoint] !== ' ' &&
        sourceCode[startingPoint] !== '\t'
      ) {
        buf = '';
        startingPoint--;
        continue;
      }

      buf += sourceCode[startingPoint];
      startingPoint--;
    }

    return buf;
  }

  private convertSnippetToText(
    node: IParser.SyntaxNode,
    sourceCode: string,
  ): string {
    const initialIndentation = this.getInitialIndentation(
      node.startIndex,
      sourceCode,
    );

    return initialIndentation + getNodeText(node);
  }

  async extractSnippets(
    fileContent: string,
    language: LanguageName,
  ): Promise<string[]> {
    const parser = this.snippetParseService.getTSParser(language);

    let parsedCode: IParser.Tree;

    try {
      parsedCode = parser.parse(fileContent);
    } catch (error) {
      console.error('Error parsing code:', error);
      return [];
    }

    const validNodes = this.findValidNodes(parsedCode.rootNode);
    const validSnippets = validNodes.map((node) =>
      this.convertSnippetToText(node, fileContent),
    );

    return validSnippets;
  }

  filterSnippets(snippets: string[]): string[] {
    return snippets
      .filter((snippet) => filterSnippetLength(snippet))
      .filter((snippet) => filterLinesNumber(snippet))
      .filter((snippet) => filterLineLength(snippet))
      .filter((snippet) => filterSnippetSpecialCharacters(snippet))
      .filter((snippet) => filterTabsInBetween(snippet));
  }

  formatCode(code: string): string | null {
    code = removeInvalidWhitespaces(code);

    const indentationStyle = detectIndentationStyle(code);
    // console.log("Detected indentation style:", indentationStyle);

    switch (indentationStyle.type) {
      case 'mixed':
        // console.warn("Mixed indentation is not supported");
        return null;
      case 'none':
        return code;
      case 'space':
        indentationStyle.value.unshift(0);
        indentationStyle.value.sort((a, b) => a - b);
        break;
    }

    let codeLines = code.split('\n').map((line) => {
      const initialWhitespaces = countInitialWhitespaces(line);

      line = line.trim();

      if (!indentationStyle.value) {
        return '\t'.repeat(initialWhitespaces) + line;
      }

      return (
        '\t'.repeat(indentationStyle.value.indexOf(initialWhitespaces)) + line
      );
    });

    codeLines = adjustIndentationOffset(codeLines);

    return codeLines.join('\n');
  }
}
