import {Languages} from "@/constants/supported-languages";
import {getSupportedLanguage} from "@/utils/game-utils";
import "dotenv/config";
import {getSnippetRawLink} from "@/utils/api/snippet-utils";

const GITHUB_API_URL = "https://api.github.com";
const TOKEN = process.env.GITHUB_API_TOKEN;

export async function fetchRandomCodeFiles(language: Languages): Promise<string[]> {
  const extensionsFilter = getSupportedLanguage(language)
    .extensions.map((extension) => `extension:${extension}`)
    .join(" ");

  const params = new URLSearchParams({
    q: `language:${language} size:>3000 ${extensionsFilter}`,
    page: Math.ceil(Math.random() * 10).toString(),
    per_page: '100'
  });

  const request = () =>
    fetch(`${GITHUB_API_URL}/search/code?${params}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      },
      next: {
        revalidate: 1000 * 60 * 3, // 3 minutes. We can have maximum n_of_languages * 10 requests every 3 minutes. Considering 10 languages, that makes maximum 2000 requests per hour, which is well below the limit of 5000 requests per hour
      }
    });

  let response = await (await request()).json();

  console.log(response);

  // Sometimes the request is succesfull but the items array is empty. In this case, we just need to re-try the request
  if (response.items.length === 0) {
    response = await request();
  }

  if (response.items.length === 0) {
    throw "Request was successfull but the items array was empty for two times in a row";
  }

  return response.items.map((item: unknown) => getSnippetRawLink(item));
}

export async function getFileContent(rawUrl: string): Promise<string> {
  const response = await fetch(rawUrl);

  return response.text();
}
