import {ILanguage} from "@/shared/types/language";

const GITHUB_API_URL = "https://api.github.com";
const MAX_ATTEMPTS = 3;
const PER_PAGE = 100;
const MIN_FILE_SIZE = 3000;

interface FileMetadata {
  repository: string;
  path: string;
  commit: string;
  sha: string;
}

interface GitHubSearchResponse {
  items?: {
    repository: {full_name: string};
    path: string;
    url: string;
    sha: string;
  }[];
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

export async function fetchFilesFromGithub(language: ILanguage, page: number): Promise<FileMetadata[]> {
  const token = getToken();
  const extensionsFilter = language.extensions.map((ext) => `extension:${ext}`).join(" ");
  const params = new URLSearchParams({
    q: `language:${language.name} size:>${MIN_FILE_SIZE} ${extensionsFilter}`,
    page: page.toString(),
    per_page: PER_PAGE.toString(),
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
      console.warn(`Received 403 (rate limit) fetching ${language.name} files on page ${page}. Attempt ${attempt}/${MAX_ATTEMPTS}.`);
      await waitForGitHubRateLimitReset(token);
      continue;
    }

    if (!response.ok) {
      throw new Error(`GitHub search failed for ${language.name} on page ${page} (attempt ${attempt}/${MAX_ATTEMPTS}) with status ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as GitHubSearchResponse;
    const items = data.items ?? [];

    if (items.length > 0) {
      console.info(`Fetched ${items.length} files for ${language.name} on page ${page} (attempt ${attempt}/${MAX_ATTEMPTS}).`);
      return items.map((item) => {
        return {
          repository: item.repository.full_name,
          path: item.path,
          commit: item.url.split("?ref=")[1],
          sha: item.sha,
        };
      });
    }

    if (attempt < MAX_ATTEMPTS) {
      console.warn(`No files returned for ${language.name} on page ${page} (attempt ${attempt}/${MAX_ATTEMPTS}). Retrying...`);
    }
  }

  throw new Error(`No files returned for ${language.name} on page ${page} after ${MAX_ATTEMPTS} attempts.`);
}

export async function getFilesForLanguage(language: ILanguage, {pagesPerLanguage = 10}: {pagesPerLanguage?: number} = {}): Promise<FileMetadata[]> {
  const files: FileMetadata[] = [];
  for (let page = 1; page <= pagesPerLanguage; page += 1) {
    try {
      const file = await fetchFilesFromGithub(language, page);
      files.push(...file);
    } catch (error) {
      throw new Error(`Error fetching files for ${language.name} on page ${page}: ${error}`);
    }
  }

  return files;
}
