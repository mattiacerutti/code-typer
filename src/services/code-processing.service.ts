import {getTSParser} from "./ts-parser.service";
import Parser from "web-tree-sitter";

const MAX_LINES = 11;
const MAX_LINE_LENGTH = 60;

const MAX_SNIPPET_LENGTH = 300;
const MIN_SNIPPET_LENGTH = 100;

function filterLinesNumber(snippet: string): boolean {
   const numLines = snippet.split("\n").length;
   return numLines <= MAX_LINES;
}

function filterLineLength(snippet: string): boolean {
   const lines = snippet.split("\n");
   return lines.every((line) => line.length <= MAX_LINE_LENGTH);
}

function filterSnippetLength(snippet: string): boolean {
   return snippet.length >= MIN_SNIPPET_LENGTH && snippet.length <= MAX_SNIPPET_LENGTH;
}

function isValidNode(nodeType: string) {
   return (
      nodeType === "function_declaration" ||
      nodeType === "function_definition" ||
      nodeType === "class_declaration" ||
      nodeType === "class_definition" ||
      nodeType === "method_declaration"
   );
}

function detectIndentationStyle(snippet: string): {type: string; value: null | number[]} {
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

   if (tabCount > 0) {
      return {type: "tab", value: null};
   } else {
      const spaceKeys = Object.keys(spaceCounts).map(Number);

      if (spaceKeys.length === 0) {
         return {type: "none", value: null};
      }
      return {type: "space", value: spaceKeys};
   }
}

function isLanguageWithFinalPart(language: string): boolean {
   return language != "python";
}

class CodeProcessingService {
   static async extractSnippets(fileContent: string, language: string): Promise<string[]> {
      const parser = await getTSParser(language);

      let parsedCode: Parser.Tree;

      try {
         parsedCode = parser.parse(fileContent);
      } catch (error) {
         console.error("Error parsing code:", error);
         return [];
      }

      const validNodes = this.findValidNodes(parsedCode.rootNode);
      const validSnippets: string[] = validNodes.map((node) => this.getNodeText(node));

      return validSnippets;
   }

   static filterSnippets(snippets: string[]): string[] {
      return snippets
         .filter((snippet) => filterSnippetLength(snippet))
         .filter((snippet) => filterLinesNumber(snippet))
         .filter((snippet) => filterLineLength(snippet));
   }

   static findValidNodes(node: Parser.SyntaxNode): Parser.SyntaxNode[] {
      let nodes = [];
      if (isValidNode(node.type)) {
         nodes.push(node);
      }
      for (let i = 0; i < node.childCount; i++) {
         const child = node.child(i);
         if (child === null) continue;
         nodes = nodes.concat(CodeProcessingService.findValidNodes(child));
      }
      return nodes;
   }

   static getNodeText(node: Parser.SyntaxNode): string {
      return node.text;
   }

   static formatCode(code: string, language: string): string {
      function countInitialWhitespace(line: string) {
         const match = line.match(/^\s+/);
         if (match) {
            return match[0].length;
         }
         return 0;
      }

      //Remove whitespaces that are not \t, \n or ' '
      code = code.replace(/[^\S\t\n ]/g, "");

      const indentationStyle = detectIndentationStyle(code);
      console.log("Detected indentation style:", indentationStyle);

      // If there are no whitespaces
      if (indentationStyle.type === "none") {
         return code;
      }

      // We essentialy create a list that contains all the different numbers of spaces used in the code. Then we sort it. Each different number will be a new indentation level.
      if (indentationStyle.type === "space" && indentationStyle.value !== null) {
         indentationStyle.value.unshift(0);
         indentationStyle.value.sort((a, b) => a - b);
      }

      let codeLines = code.split("\n");

      codeLines = codeLines.map((line) => {
         const initialWhitespaces = countInitialWhitespace(line);

         line = line.trim();

         if (!indentationStyle.value) {
            return "\t".repeat(initialWhitespaces) + line;
         }

         return "\t".repeat(indentationStyle.value.indexOf(initialWhitespaces)) + line;
      });

      // We need to do this because in languages where a scope end with something like "}", the final line is commonly bad indented (like when you copy a piece of code)
      if (isLanguageWithFinalPart(language)) {

         // Since the last line should indentation depth equal to 0, we calculate the offset and subtract it through all the other lines
         const finalLineWhitespaces = countInitialWhitespace(codeLines[codeLines.length - 1]);
         for (let i = 1; i < codeLines.length; i++) {
            codeLines[i] = codeLines[i].slice(finalLineWhitespaces);
         }
      }

      return codeLines.join("\n");
   }
}

export default CodeProcessingService;