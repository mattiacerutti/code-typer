/* eslint-disable @typescript-eslint/no-explicit-any */
import {ILanguage} from "@/types/language";
import dotenv from "dotenv";

dotenv.config();

const GITHUB_API_URL = "https://api.github.com";
const TOKEN = process.env.GITHUB_API_TOKEN;

async function waitForGitHubRateLimitReset(): Promise<void> {
  const res = await fetch(`${GITHUB_API_URL}/rate_limit`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  if (!res.ok) {
    console.error(`Failed to fetch rate limit status: ${res.status} ${res.statusText}`);
    return;
  }

  const json = await res.json();
  const reset = json.resources.code_search.reset * 1000;
  const now = Date.now();
  const waitTime = reset - now;

  if (waitTime > 0) {
    console.warn(`Rate limited by GitHub. Waiting ${waitTime}ms until reset.`);
    await new Promise((resolve) => setTimeout(resolve, waitTime + 3000));
  }
}

export function getSnippetRawLink(data: any): string {
  const baseUrl = "https://raw.githubusercontent.com";

  const repository = data.repository.full_name;
  const sha = data.url.split("?ref=")[1];
  const path = data.path;
  return `${baseUrl}/${repository}/${sha}/${path}`;
}

export async function fetchLanguageSnippets(language: ILanguage, page: number): Promise<string[]> {
  const extensionsFilter = language.extensions.map((ext: string) => `extension:${ext}`).join(" ");
  const params = new URLSearchParams({
    q: `language:${language.name} size:>3000 ${extensionsFilter}`,
    page: page.toString(),
    per_page: "100",
  });

  const request = async () => {
    return fetch(`${GITHUB_API_URL}/search/code?${params}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
  };

  let i = 0;
  let response = await request();
  let responseJson = await response.json();
  while (i < 2) {
    if (response.status === 403) {
      console.warn(`Received 403 from GitHub. Attempting to fetch rate limit info.`);
      await waitForGitHubRateLimitReset();

      response = await request();
      responseJson = await response.json();
    }

    if (response.status !== 200) {
      throw new Error(`Request n. ${i + 1} failed with status ${response.status}: ${response.statusText}`);
    }

    if (responseJson.items && responseJson.items.length > 0) {
      break;
    }

    console.warn(`No items found in try n. ${i + 1} for ${language.name} on page ${page}, retrying...`);
    i++;
  }

  if (responseJson.items.length === 0) {
    throw new Error(`No items found after ${i + 1} retries`);
  }

  console.info(`Fetched ${responseJson.items.length} snippets for ${language.name} on page ${page} (after ${i + 1} retries)`);
  return responseJson.items.map((item: any) => getSnippetRawLink(item));
}
