export async function getFileContent(rawUrl: string): Promise<string> {
  const response = await fetch(rawUrl);

  return response.text();
}
