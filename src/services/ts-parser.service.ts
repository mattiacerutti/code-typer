import Parser from "web-tree-sitter";


const languages: {[key: string]: string} = {
   c: "public/wasm/tree-sitter-c.wasm",
   cpp: "public/wasm/tree-sitter-cpp.wasm",
   csharp: "public/wasm/tree-sitter-c-sharp.wasm",
   java: "public/wasm/tree-sitter-java.wasm",
   javascript: "public/wasm/tree-sitter-javascript.wasm",
   python: "public/wasm/tree-sitter-python.wasm",
   typescript: "public/wasm/tree-sitter-typescript.wasm",
   lua: "public/wasm/tree-sitter-lua.wasm",
}



export const getTSParser = async (language: string) => {
   await Parser.init({
      locateFile(scriptName: string) {
         return `public/wasm/${scriptName}`;
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
