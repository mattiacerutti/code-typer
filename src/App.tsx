import {useCallback, useEffect, useRef, useState} from "react";
import TextBox from "./components/TextBox";
import {getRandomCodeSnippet} from "@/utils/getRandomCodeSnippet";

function App() {
   const [snippet, setSnippet] = useState<string | null>(null);

   const codeSnippets = useRef<{val: string[]; index: number}>({
      val: [],
      index: -1,
   });

   const LANGUAGE = "java";

   useEffect(() => {
      getRandomCodeSnippet(LANGUAGE).then((ret) => {
         codeSnippets.current.val = ret;
         codeSnippets.current.index = 0;
         setSnippet(codeSnippets.current.val[codeSnippets.current.index]);
      });
   }, []);

   const goToNextSnippet = useCallback(() => {
      if (codeSnippets.current.index + 1 < codeSnippets.current.val.length) {
         codeSnippets.current.index++;
         setSnippet(codeSnippets.current.val[codeSnippets.current.index]);
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
