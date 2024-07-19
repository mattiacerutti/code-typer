import TextBox from "./components/TextBox";

function App() {
   const originalText: string =
      "Label *makeLabel(Context *context)\n{\n\tLabel *ret = xmalloc(sizeof(*ret));\n\n\tret->name = xmalloc(12);\n\tsprintf(ret->name, \"'lbl%s'\", makeHexadecimalValue(8));\n\tcontext->currfunc->numlabels++;\n\n\taddLabelToList(ret, &context->currfunc->labels);\n\n\treturn ret;\n}";

   return (
      <div className="w-screen h-screen flex justify-center items-center">
         <TextBox codeText={originalText}/>
      </div>
   );
}

export default App;
