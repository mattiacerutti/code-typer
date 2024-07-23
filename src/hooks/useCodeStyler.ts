import {useState, useEffect, useCallback, useRef} from "react";
import {ILine} from "@/types/Line";
import hljs from "highlight.js";

const useCodeStyler = (code: string, language: string, lines: ILine[]) => {
  const [codeStyle, setCodeStyle] = useState<string[][]>([]);

  const isStylingComplete = useRef(false);

  const wrapCharactersInSpans = (code: string) => {
    return code
      .split("")
      .map((char) => `<span>${char}</span>`)
      .join("");
  };

  const extractClassesFromElement = useCallback((node: Node, styilingArray: string[] = [], prevClass: string = "") => {

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
  }, []);

  const extractCodeStyling = useCallback(
    (node: Node): string[] => {
      const styilingArray: string[] = [];

      Array.from(node.childNodes).forEach((child) => {
        extractClassesFromElement(child, styilingArray);
      });

      return styilingArray;
    },
    [extractClassesFromElement]
  );

  const getCodeStyling = useCallback(
    (code: string, language: string) => {
      const validLanguage = hljs.getLanguage(language) ? language : "plaintext";

      // Create a temporary list of Span that contain all the code
      const wrappedCode = wrapCharactersInSpans(code);

      // Create a temporary parent element
      const tempElement = document.createElement("div");
      tempElement.innerHTML = wrappedCode;

      // Highligh the parent element
      hljs.configure({languages: [validLanguage], ignoreUnescapedHTML: true});
      hljs.highlightElement(tempElement);


      // Extract the code styling
      const codeStyiling = extractCodeStyling(tempElement);

      return codeStyiling;
    },
    [extractCodeStyling]
  );

  useEffect(() => {
    if (lines.length > 0 && !isStylingComplete.current) {
      const codeStyle = getCodeStyling(code, language);

      const styleArray: string[][] = [];

      let cont = 0;
      lines.map((line) => {
        styleArray.push(codeStyle.slice(cont, cont + line.text.length));
        cont += line.text.length;
      });

      isStylingComplete.current = true;
      setCodeStyle(styleArray);
    }
  }, [getCodeStyling, lines, code, language]);

  return {codeStyle};
};

export default useCodeStyler;
