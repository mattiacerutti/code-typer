import {useState, useEffect, useCallback, useRef} from "react";
import {Line} from "@/models/Line";
import hljs from "highlight.js";

const useCodeStyler = (code: string, language: string, lines: Line[]) => {
   const [codeStyle, setCodeStyle] = useState<string[][]>([]);

   const isStylingComplete = useRef(false);

   const wrapCharactersInSpans = (code: string) => {
      return code
         .split("")
         .map((char) => `<span>${char}</span>`)
         .join("");
   };

   const extractClassesFromElement = useCallback((node: Node, styilingArray: string[] = [], prevClass: string = "") => {
      // If the node it's just text
      if (node.nodeType === Node.TEXT_NODE) {
         node.textContent!.split("").forEach(() => {
            styilingArray.push(prevClass);
         });
         return styilingArray;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
         const newClass = `${prevClass} ${(node as HTMLElement).classList.value}`;
         //Check if child is text or another element node
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
         const wrappedCode = wrapCharactersInSpans(code);

         // Create a temporary DOM element to highlight and parse the HTML
         const tempElement = document.createElement("div");
         tempElement.innerHTML = wrappedCode;

         // Apply Highlight.js to the container
         hljs.configure({languages: [validLanguage], ignoreUnescapedHTML: true});
         hljs.highlightElement(tempElement);

         const codeStyiling = extractCodeStyling(tempElement);

         return codeStyiling;
      },
      [extractCodeStyling]
   );

   useEffect(() => {
      if (lines.length > 0 && !isStylingComplete.current) {
         const codeStyle = getCodeStyling(code, language);

         let cont = 0;

         const styleArray: string[][] = [];

         for (let i = 0; i < lines.length; i++) {
            const start = cont;
            const lineLength = start + lines[i].text.length;

            cont += lines[i].text.length;

            styleArray.push(codeStyle.slice(start, lineLength));
         }
         isStylingComplete.current = true;
         setCodeStyle(styleArray);
      }
   }, [getCodeStyling, lines, code, language]);

   return {codeStyle};
};

export default useCodeStyler;
