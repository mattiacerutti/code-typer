import {useCallback, useEffect, useRef, useState} from "react";
import TypingBox from "./TypingBox";
import {getRandomCodeSnippet} from "@/services/snippets/snippet.service";
import {LanguageName} from "@/types/CodeLanguage";

function GameBox() {
  const [activeSnippet, setActiveSnippet] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageName>(LanguageName.TypeScript);

  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isRefreshButtonDisabled, setIsRefreshButtonDisabled] = useState<boolean>(false);

  const [isCapsLockOn, setIsCapsLockOn] = useState<boolean>(false);

  const codeSnippets = useRef<string[]>([]);

  const handleGameOver = useCallback(() => {
    setIsGameOver(true);
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      setActiveSnippet(null);
      getRandomCodeSnippet(selectedLanguage).then((ret) => {
        codeSnippets.current = ret;
        setActiveSnippet(codeSnippets.current[0]);
      });
    }
  }, [selectedLanguage]);

  const refreshSnippet = useCallback(() => {
    setIsRefreshButtonDisabled(true);

    // If we have only 3 snippet left, we re-fetch and append them to the end of the array
    if (codeSnippets.current.length <= 3) {
      getRandomCodeSnippet(selectedLanguage).then((ret) => {
        codeSnippets.current.push(...ret);
        setIsRefreshButtonDisabled(false);
      });
    } else {
      setTimeout(() => {
        setIsRefreshButtonDisabled(false);
      }, 1000 * 1);
    }

    codeSnippets.current.shift();
    setActiveSnippet(codeSnippets.current[0]);
  }, [selectedLanguage]);

  if (isGameOver) return <div>Game Over</div>;

  return (
    <>
      {activeSnippet && (
        <>
          <div className={`text-red-500 relative bottom-8 ${!isCapsLockOn && "opacity-0"} font-bold text-2xl`}>Caps Lock is on</div>
          <div className="flex flex-col gap-10 justify-center items-center">
            <TypingBox codeSnippet={activeSnippet} codeLanguage={selectedLanguage} onGameFinished={handleGameOver} setIsCapsLockOn={setIsCapsLockOn} key={activeSnippet} />
            <div className="flex flex-row gap-1.5 content-between">
              <button
                className="px-6 py-3 bg-slate-200 text-slate-900 font-medium rounded-md hover:bg-slate-300 disabled:opacity-20"
                onClick={() => refreshSnippet()}
                disabled={isRefreshButtonDisabled}
              >
                {!isRefreshButtonDisabled ? "Refresh Snippet" : "Wait.."}
              </button>
              <select
                disabled={isRefreshButtonDisabled}
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value as LanguageName);
                }}
                className="px-6 py-3 bg-slate-200 text-slate-900 font-medium rounded-md hover:bg-slate-300 disabled:opacity-20"
              >
                {Object.values(LanguageName).map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
      {!activeSnippet && <div>Loading...</div>}
    </>
  );
}

export default GameBox;
