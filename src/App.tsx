import {useCallback, useEffect, useRef, useState} from "react";
import TypingBox from "./components/TypingBox";
import {getRandomCodeSnippet} from "@/services/snippets/snippet.service";
import {LanguageName} from "./types/CodeLanguage";

function App() {
  const [snippet, setSnippet] = useState<string | null>(null);

  const codeSnippets = useRef<string[]>([]);
  const codeSnippetsIndex = useRef<number>(0);

  const LANGUAGE: LanguageName = LanguageName.C;

  useEffect(() => {
    if (LANGUAGE) {
      getRandomCodeSnippet(LANGUAGE).then((ret) => {
        codeSnippets.current = ret;
        codeSnippetsIndex.current = 0;
        setSnippet(codeSnippets.current[codeSnippetsIndex.current]);
      });
    }
  }, [LANGUAGE]);

  const goToNextSnippet = useCallback(() => {
    if (codeSnippetsIndex.current + 1 < codeSnippets.current.length) {
      codeSnippetsIndex.current++;
      setSnippet(codeSnippets.current[codeSnippetsIndex.current]);
    }
  }, []);

  return (
    <div className="w-screen h-screen flex justify-center items-center flex-col">
      {snippet && <TypingBox codeSnippet={snippet} codeLanguage={LANGUAGE} key={snippet} />}
      <button onClick={() => goToNextSnippet()}>Next Snippet</button>
      {!snippet && <div>Loading...</div>}
    </div>
  );
}

export default App;
