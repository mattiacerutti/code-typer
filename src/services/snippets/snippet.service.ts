import {fetchFileDetails, fetchRandomCodeFiles, getFileContent} from "@/services/snippets/snippet-fetch.service";
import {extractSnippets, filterSnippets, formatCode} from "@/services/snippets/snippet-process.service";

async function getSnippetsFomLink(link: string, language: string): Promise<string[]> {
  const fileDetails = await fetchFileDetails(link);
  const fileContent = await getFileContent(fileDetails);

  let codeSnippets = await extractSnippets(fileContent, language);

  codeSnippets = filterSnippets(codeSnippets);

  return codeSnippets;
}

export const getRandomCodeSnippet = async (language: string): Promise<string[]> => {
  const fetchedFiles = await fetchRandomCodeFiles(language).catch((error) => {
    console.error("Error fetching random code files:", error);
    return [];
  });

  let codeSnippets: string[] = [];
  while (codeSnippets.length < 5) {
    if (fetchedFiles.length === 0) break;

    const randomIndex = Math.floor(Math.random() * fetchedFiles.length);
    const randomFileLink = fetchedFiles[randomIndex];

    const snippets = await getSnippetsFomLink(randomFileLink, language);
    codeSnippets.push(...snippets);

    fetchedFiles.splice(randomIndex, 1);
  }

  if (codeSnippets.length === 0) throw "Couldn't find any functions in the fetched files";

  codeSnippets = codeSnippets
    .map((snippet) => {
      console.log("Raw snippet:", JSON.stringify(snippet));
      const formattedSnippet = formatCode(snippet, language);

      if (!formattedSnippet) return null;

      console.log("Formatted snippet:", JSON.stringify(formattedSnippet));

      return formattedSnippet;
    })
    .filter((snippet) => snippet !== null);

  return codeSnippets;
};
