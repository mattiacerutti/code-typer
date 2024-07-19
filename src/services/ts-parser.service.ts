import Parser from "web-tree-sitter";


const languages: {[key: string]: string} = {
   c: "wasm/tree-sitter-c.wasm",
   cpp: "wasm/tree-sitter-cpp.wasm",
   csharp: "wasm/tree-sitter-c-sharp.wasm",
   java: "wasm/tree-sitter-java.wasm",
   javascript: "wasm/tree-sitter-javascript.wasm",
   python: "wasm/tree-sitter-python.wasm",
   typescript: "wasm/tree-sitter-typescript.wasm",
   lua: "wasm/tree-sitter-lua.wasm",
}



export const getTSParser = async (language: string) => {
   await Parser.init({
      locateFile(scriptName: string) {
         return `wasm/${scriptName}`;
      },
   });
   const parser = new Parser();

   if (language in languages) {
      const languageWasm = await Parser.Language.load(languages[language]);
      parser.setLanguage(languageWasm);
   } else {
      throw (`Language ${language} not supported by TSParser`);
   }

   return parser;
};
