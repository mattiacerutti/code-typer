import fetch from 'node-fetch';

async function getFileContent(rawUrl: string): Promise<string> {
  
  const response = await fetch(rawUrl);



  return response.text();
}

export async function getFilesFromUrls(snippetUrls: string[]): Promise<{url: string; content: string}[]> {
  const filePromises = snippetUrls.map(async (snippetUrl: string) => {
    // Get file content from snippetUrl
    return {
      url: snippetUrl,
      content: await getFileContent(snippetUrl),
    };
  });

  // Fetches file contents from all files simultaneously
  return (await Promise.all(filePromises)).flat();
}
