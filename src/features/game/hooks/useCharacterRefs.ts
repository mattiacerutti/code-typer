import {IParsedSnippet} from "@/shared/types/snippet";
import React from "react";
import {useRef} from "react";

export const useCharacterRefs = (snippet: IParsedSnippet) => {
  return useRef(snippet.map(() => React.createRef<HTMLSpanElement>()));
};
