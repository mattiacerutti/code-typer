import {useState, useEffect, useMemo} from "react";
import {parseSnippet} from "@/services/snippets/snippet-parse.service";
import {ILine} from "@/types/Line";

const useCodeParser = (originalText: string) => {
  const [lines, setLines] = useState<ILine[]>([]);

  const autoClosingChars: {[key: string]: string} = useMemo(
    () => ({
      "(": ")",
      "[": "]",
      "{": "}",
      '"': '"',
      "'": "'",
    }),
    []
  );

  useEffect(() => {
    const linesArray = parseSnippet(originalText, autoClosingChars);
    setLines(linesArray);
  }, [originalText, autoClosingChars]);

  return {lines, setLines, autoClosingChars};
};

export default useCodeParser;
