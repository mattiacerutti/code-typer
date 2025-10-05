import {SnippetSourceFile} from "@/features/snippets/types/snippet-source";

async function getFileContent(rawUrl: string): Promise<string> {
  const response = await fetch(rawUrl);
  return response.text();
}

export async function getFilesFromUrls(snippetUrls: string[]): Promise<SnippetSourceFile[]> {
  const filePromises = snippetUrls.map(async (snippetUrl: string) => ({
    url: snippetUrl,
    content: await getFileContent(snippetUrl),
  }));

  return Promise.all(filePromises);
}
