import {fetchFileDetails, fetchRandomCodeFiles, getFileContent} from "@/services/snippets/snippet-fetch.service";
import {extractSnippets, filterSnippets, formatCode} from "@/services/snippets/snippet-process.service";
import {LanguageName} from "@/types/CodeLanguage";
import {MIN_CACHED_SNIPPETS, SNIPPETS_SIMULTANEOUS_REQUESTS} from "@/utils/constants";
import {getUniqueRandomIndexes} from "@/utils/snippets/snippet-utils";

async function getSnippetsFomLink(link: string, language: LanguageName): Promise<string[]> {
  const fileDetails = await fetchFileDetails(link);
  const fileContent = await getFileContent(fileDetails);

  let codeSnippets = await extractSnippets(fileContent, language);
  codeSnippets = filterSnippets(codeSnippets);

  return codeSnippets;
}

async function getSnippetsBatch(fileLinks: string[], language: LanguageName): Promise<string[]> {
  const codeSnippets: string[] = [];
  while (codeSnippets.length < MIN_CACHED_SNIPPETS) {
    if (fileLinks.length === 0) break;

    // Gets N unquie random indexes. Number could be changed to increase concurrency
    const randomIndexes = getUniqueRandomIndexes(fileLinks.length, SNIPPETS_SIMULTANEOUS_REQUESTS);

    // Simultaneously get snippets different files
    const snippetPromises = randomIndexes.map((randomIndex) => getSnippetsFomLink(fileLinks[randomIndex], language));
    const snippets = (await Promise.all(snippetPromises)).flat();

    codeSnippets.push(...snippets);

    // Removes already fetched files
    fileLinks = fileLinks.filter((_, i) => !randomIndexes.includes(i));
  }

  return codeSnippets;
}

export const getRandomCodeSnippet = async (language: LanguageName): Promise<string[]> => {
  const fetchedFiles = await fetchRandomCodeFiles(language).catch((error) => {
    console.error("Error fetching random files:", error);
    return [];
  });

  let codeSnippets: string[] = await getSnippetsBatch(fetchedFiles, language);

  if (codeSnippets.length === 0) throw "Couldn't find any functions in any of the fetched files";

  codeSnippets = codeSnippets
    .map((snippet) => {
      console.log("Raw snippet:", JSON.stringify(snippet));
      const formattedSnippet = formatCode(snippet, language);

      if (!formattedSnippet) return null;

      console.log("Formatted snippet:", JSON.stringify(formattedSnippet));

      return formattedSnippet;
    })
    .filter((snippet) => snippet !== null);

  // Shuffle snippets before returning  
  return codeSnippets.sort(() => 0.5 - Math.random());
};
