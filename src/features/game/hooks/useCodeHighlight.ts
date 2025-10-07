import {useState, useEffect} from "react";
import hljs from "highlight.js";

const useCodeHighlight = (snippet: string, languageHighlightAlias: string) => {
  const [codeHighlight, setCodeHighlight] = useState<string[] | null>(null);

  useEffect(() => {
    const wrapCharactersInSpans = (code: string) => {
      return code
        .split("")
        .map((char) => `<span>${char}</span>`)
        .join("");
    };

    const extractClassesFromElement = (node: Node, styilingArray: string[] = [], prevClass: string = "") => {
      // If the node it's just text, just push the parent class for every character
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent!.split("").forEach(() => {
          styilingArray.push(prevClass);
        });
        return styilingArray;
      }

      // If the node it's an node
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Merge the node's class with the parent's
        const newClass = `${prevClass} ${(node as HTMLElement).classList.value}`;

        // If node have children, recursively call the function
        if (node.childNodes.length > 1) {
          node.childNodes.forEach((child) => {
            return extractClassesFromElement(child, styilingArray, newClass);
          });
        } else {
          node.textContent!.split("").forEach(() => {
            styilingArray.push(newClass);
          });
        }
      }

      return styilingArray;
    };

    const extractCodeStyling = (node: Node): string[] => {
      const styilingArray: string[] = [];

      Array.from(node.childNodes).forEach((child) => {
        extractClassesFromElement(child, styilingArray);
      });

      return styilingArray;
    };

    const getCodeHighlighting = (snippet: string, languageHighlightAlias: string) => {
      const hljsLanguage = hljs.getLanguage(languageHighlightAlias);
      const validLanguage = hljsLanguage && hljsLanguage.name ? hljsLanguage.name : "plaintext";

      // Create a temporary list of Span that contain all the code
      const wrappedCode = wrapCharactersInSpans(snippet);

      // Create a temporary parent element
      const tempElement = document.createElement("div");
      tempElement.innerHTML = wrappedCode;

      // Highligh the parent element
      hljs.configure({languages: [validLanguage], ignoreUnescapedHTML: true});
      hljs.highlightElement(tempElement);

      // Extract the code styling
      const codeStyiling = extractCodeStyling(tempElement);

      return codeStyiling;
    };

    const codeHighlighting = getCodeHighlighting(snippet, languageHighlightAlias);
    setCodeHighlight(codeHighlighting);
  }, [snippet, languageHighlightAlias]);

  useEffect(() => {
    //@ts-expect-error custom theme for code highlighting
    import("highlight.js/styles/github.css");
  }, []);

  return {codeHighlight};
};

export default useCodeHighlight;
