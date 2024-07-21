import {FetchService} from "@/services/code-fetch.service";
import CodeProcessingService from "@/services/code-processing.service";

async function getSnippetsFomLink(link: string, language: string): Promise<string[]> {
   const fileDetails = await FetchService.fetchFileDetails(link);
   const fileContent = await FetchService.getFileContent(fileDetails);

   let codeSnippets = await CodeProcessingService.extractSnippets(fileContent, language);

   codeSnippets = CodeProcessingService.filterSnippets(codeSnippets);

   return codeSnippets;
}

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
   } while (codeSnippets.length < 5);

   if (codeSnippets.length === 0) throw "Couldn't find any functions in the fetched files";
   
   codeSnippets = codeSnippets
      .map((snippet) => {
         console.log("Raw snippet:", JSON.stringify(snippet));
         const formattedSnippet = CodeProcessingService.formatCode(snippet, language);

         if (!formattedSnippet) return null;

         console.log("Formatted snippet:", JSON.stringify(formattedSnippet));

         return formattedSnippet;
      })
      .filter((snippet) => snippet !== null);

   return codeSnippets;
};
