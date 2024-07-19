import {useEffect, useState} from "react";
import TextBox from "./components/TextBox";
import {getRandomCodeSnippet} from "@/utils/getRandomCodeSnippet";

function App() {

   const [snippet, setSnippet] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);

   const LANGUAGE = "cpp";

   useEffect(() => {
      setLoading(true);
      getRandomCodeSnippet(LANGUAGE).then((codeSnippet) => {
         setSnippet(codeSnippet);
         setLoading(false);
      });
   }, []);

   return (
      <div className="w-screen h-screen flex justify-center items-center">
        {!loading && snippet && <TextBox codeText={snippet} codeLanguage={LANGUAGE}/>}
        {loading && <div>Loading...</div>}
      </div>
   );
}

export default App;
