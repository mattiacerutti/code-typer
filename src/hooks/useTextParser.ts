import { useState, useEffect, useMemo } from "react";
import { parseText } from "../utils/textParser";
import { Line } from '../models/Line';


const useTextParser = (originalText: string) => {
  const [lines, setLines] = useState<Line[]>([]);

  const autoClosingChars: { [key: string]: string } = useMemo(
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
    const linesArray = parseText(originalText, autoClosingChars);
    setLines(linesArray);
  }, [originalText, autoClosingChars]);

  return { lines, setLines, autoClosingChars };
};

export default useTextParser;