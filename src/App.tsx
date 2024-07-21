import {useCallback, useEffect, useRef, useState} from "react";
import TextBox from "./components/TextBox";
import {getRandomCodeSnippet} from "@/utils/getRandomCodeSnippet";

function App() {
  const [snippet, setSnippet] = useState<string | null>(null);

  const codeSnippets = useRef<string[]>([]);
  const codeSnippetsIndex = useRef<number>(0);

  const LANGUAGE = "java";

  useEffect(() => {
    getRandomCodeSnippet(LANGUAGE).then((ret) => {
      codeSnippets.current = ret;
      codeSnippetsIndex.current = 0;
      setSnippet(codeSnippets.current[codeSnippetsIndex.current]);
    });
  }, []);

  const goToNextSnippet = useCallback(() => {
    if (codeSnippetsIndex.current + 1 < codeSnippets.current.length) {
      codeSnippetsIndex.current++;
      setSnippet(codeSnippets.current[codeSnippetsIndex.current]);
    }
  }, []);

  return (
    <div className="w-screen h-screen flex justify-center items-center flex-col">
      {snippet && <TextBox codeSnippet={snippet} codeLanguage={LANGUAGE} key={snippet} />}
      <button onClick={() => goToNextSnippet()}>Next Snippet</button>
      {!snippet && <div>Loading...</div>}
    </div>
  );
}

export default App;
