import {ILanguage} from "@/shared/types/language";
import {PrismaClient} from "@prisma/client";

const GITHUB_API_URL = "https://api.github.com";
const RAW_GITHUB_BASE_URL = "https://raw.githubusercontent.com";
const MAX_ATTEMPTS = 3;

interface SnippetData {
  repository: {full_name: string};
  url: string;
  path: string;
}

interface GitHubSearchResponse {
  items?: SnippetData[];
}

function getToken(): string {
  const token = process.env.GITHUB_API_TOKEN;

  if (!token) {
    throw new Error("Missing GITHUB_API_TOKEN environment variable");
  }

  return token;
}

async function waitForGitHubRateLimitReset(token: string): Promise<void> {
  const res = await fetch(`${GITHUB_API_URL}/rate_limit`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error(`Failed to fetch rate limit status: ${res.status} ${res.statusText}`);
    return;
  }

  const json = (await res.json()) as {resources: {code_search: {reset: number}}};
  const reset = json.resources.code_search.reset * 1000;
  const now = Date.now();
  const waitTime = reset - now;

  if (waitTime > 0) {
    console.warn(`Rate limited by GitHub. Waiting ${waitTime}ms until reset.`);
    await new Promise((resolve) => setTimeout(resolve, waitTime + 3000));
  }
}

function getSnippetRawLink(data: SnippetData): string {
  const repository = data.repository.full_name;
  const sha = data.url.split("?ref=")[1];
  const path = data.path;
  return `${RAW_GITHUB_BASE_URL}/${repository}/${sha}/${path}`;
}

async function fetchLanguageSnippets(language: ILanguage, page: number): Promise<string[]> {
  const token = getToken();
  const extensionsFilter = language.extensions.map((ext) => `extension:${ext}`).join(" ");
  const params = new URLSearchParams({
    q: `language:${language.name} size:>3000 ${extensionsFilter}`,
    page: page.toString(),
    per_page: "100",
  });

  const request = () =>
    fetch(`${GITHUB_API_URL}/search/code?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const response = await request();

    if (response.status === 403) {
      console.warn(`Received 403 (rate limit) fetching ${language.name} snippets on page ${page}. Attempt ${attempt}/${MAX_ATTEMPTS}.`);
      await waitForGitHubRateLimitReset(token);
      continue;
    }

    if (!response.ok) {
      throw new Error(`GitHub search failed for ${language.name} on page ${page} (attempt ${attempt}/${MAX_ATTEMPTS}) with status ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as GitHubSearchResponse;
    const items = data.items ?? [];

    if (items.length > 0) {
      console.info(`Fetched ${items.length} snippets for ${language.name} on page ${page} (attempt ${attempt}/${MAX_ATTEMPTS}).`);
      return items.map((item) => getSnippetRawLink(item));
    }

    if (attempt < MAX_ATTEMPTS) {
      console.warn(`No snippets returned for ${language.name} on page ${page} (attempt ${attempt}/${MAX_ATTEMPTS}). Retrying...`);
    }
  }

  throw new Error(`No snippets returned for ${language.name} on page ${page} after ${MAX_ATTEMPTS} attempts.`);
}

export async function seedSnippets(prisma: PrismaClient, languages: ILanguage[], {pagesPerLanguage = 10}: {pagesPerLanguage?: number} = {}): Promise<void> {
  for (const language of languages) {
    for (let page = 1; page <= pagesPerLanguage; page += 1) {
      try {
        const snippets = await fetchLanguageSnippets(language, page);

        for (const snippet of snippets) {
          await prisma.snippet.upsert({
            where: {url: snippet},
            update: {},
            create: {
              url: snippet,
              language: {
                connect: {
                  id: language.id,
                },
              },
            },
          });
        }
      } catch (error) {
        throw new Error(`Error fetching snippets for ${language.name} on page ${page}: ${error}`);
      }
    }
  }
}

export {fetchLanguageSnippets};
