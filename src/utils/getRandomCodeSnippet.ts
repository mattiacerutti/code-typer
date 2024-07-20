import {FetchService} from "@/services/code-fetch.service";
import CodeProcessingService from "@/services/code-processing.service";

async function getSnippetsFomLink(link: string, language: string): Promise<string[]> {

   const fileDetails = await FetchService.fetchFileDetails(link);
   const fileContent = await FetchService.getFileContent(fileDetails);

   let codeSnippets = await CodeProcessingService.extractSnippets(fileContent, language);

   codeSnippets = CodeProcessingService.filterSnippets(codeSnippets);

   return codeSnippets;
}
// export const getRandomCodeSnippet = async (language: string): Promise<string | null> => {
//    const fetchedFiles = await FetchService.fetchRandomCodeFiles(language).catch((error) => {
//       console.error("Error fetching random code files:", error);
//       return [];
//    });

//    let codeSnippets = [];
//    do {
//       if (fetchedFiles.length === 0) throw "Couldn't find any functions in the fetched files";

//       const randomIndex = Math.floor(Math.random() * fetchedFiles.length);
//       const randomFileLink = fetchedFiles[randomIndex];

//       codeSnippets = await getSnippetsFomLink(randomFileLink, language);

//       fetchedFiles.splice(randomIndex, 1);
//    } while (codeSnippets.length === 0);

//    const randomSnippet = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];

   

//    // const randomSnippet = 	`static inline int cc_first_nonzero_uint16( uint64_t a )\r\n{\r\n  if( cc_is_little_endian() )\r\n    return __builtin_ctzll( a ) / 16;\r\n  \r\n  return __builtin_clzll( a ) / 16;\r\n}`

//    console.log("Raw snippet:", JSON.stringify(randomSnippet));

//    const formattedSnippet = CodeProcessingService.formatCode(randomSnippet, language);

//    console.log("Formatted snippet:", JSON.stringify(formattedSnippet));

//    return formattedSnippet;
// };

export const getRandomCodeSnippet = async (language: string): Promise<string[]> => {
   const fetchedFiles = await FetchService.fetchRandomCodeFiles(language).catch((error) => {
      console.error("Error fetching random code files:", error);
      return [];
   });

   let codeSnippets: string[] = [];
   do {
      if (fetchedFiles.length === 0) break;

      const randomIndex = Math.floor(Math.random() * fetchedFiles.length);
      const randomFileLink = fetchedFiles[randomIndex];

      codeSnippets = [...codeSnippets, ...(await getSnippetsFomLink(randomFileLink, language))];

      fetchedFiles.splice(randomIndex, 1);
   } while (codeSnippets.length < 5 );

   if(codeSnippets.length === 0) throw "Couldn't find any functions in the fetched files";

   // let codeSnippets = ["PerThreadReadBuf(size_t max_buf) :\n\t\tmax_buf_(max_buf),\n\t\tbufa_(max_buf),\n\t\tbufb_(max_buf),\n\t\trdid_()\n\t{\n\t\tbufa_.resize(max_buf);\n\t\tbufb_.resize(max_buf);\n\t\treset();\n\t}"]

   
   codeSnippets = codeSnippets.map((snippet) => {
      console.log("Raw snippet:", JSON.stringify(snippet));
      const formattedSnippet = CodeProcessingService.formatCode(snippet, language);

      if(!formattedSnippet) return null;

      console.log("Formatted snippet:", JSON.stringify(formattedSnippet));

      return formattedSnippet
   }).filter((snippet) => snippet !== null)

   return codeSnippets;
};


