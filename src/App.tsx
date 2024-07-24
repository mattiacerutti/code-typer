import {useCallback, useEffect, useRef, useState} from "react";
import TypingBox from "./components/TypingBox";
import {getRandomCodeSnippet} from "@/services/snippets/snippet.service";
import {LanguageName} from "./types/CodeLanguage";

function App() {
  const [snippet, setSnippet] = useState<string | null>(null);

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageName>(LanguageName.JavaScript);

  const codeSnippets = useRef<string[]>([]);
  const codeSnippetsIndex = useRef<number>(0);

  useEffect(() => {
    if (selectedLanguage) {
      setSnippet(null);
      getRandomCodeSnippet(selectedLanguage).then((ret) => {
        codeSnippets.current = ret;
        codeSnippetsIndex.current = 0;
        setSnippet(codeSnippets.current[codeSnippetsIndex.current]);
      });
    }
  }, [selectedLanguage]);

  const goToNextSnippet = useCallback(() => {
    if (codeSnippetsIndex.current + 1 < codeSnippets.current.length) {
      codeSnippetsIndex.current++;
      setSnippet(codeSnippets.current[codeSnippetsIndex.current]);
    }
  }, []);

  return (
    <div className="w-screen h-screen flex justify-center items-center flex-col">
      {snippet && (
        <>
          <TypingBox codeSnippet={snippet} codeLanguage={selectedLanguage} key={snippet} />
          <div className="flex flex-row gap-1.5 content-between">
            <button className="px-6 py-3 bg-slate-100 text-slate-800 rounded-md hover:bg-slate-300" onClick={() => goToNextSnippet()}>
              Refresh Snippet
            </button>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value as LanguageName);
              }}
              className="px-6 py-3 bg-slate-100 text-slate-800 rounded-md hover:bg-slate-300"
            >
              <option value={LanguageName.JavaScript}>JavaScript</option>
              <option value={LanguageName.TypeScript}>TypeScript</option>
              <option value={LanguageName.C}>C</option>
              <option value={LanguageName.Cpp}>C++</option>
              <option value={LanguageName.CSharp}>C#</option>
              <option value={LanguageName.Java}>Java</option>
              <option value={LanguageName.Python}>Python</option>
              <option value={LanguageName.Lua}>Lua</option>
            </select>
          </div>
        </>
      )}
      {!snippet && <div>Loading...</div>}
    </div>
  );
}

export default App;
