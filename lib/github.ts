const GITHUB_API_URL = "https://api.github.com";
const RETRY_DELAY_MS = 1000;
const RATE_LIMIT_PADDING_MS = 3000;

type GitHubRequestParams = Record<string, string | number | boolean | undefined>;

export interface GitHubRequestOptions extends RequestInit {
  params?: GitHubRequestParams;
  maxAttempts?: number;
  retry?: boolean;
  shouldRetry?: (context: {response: Response; attempt: number; maxAttempts: number; url: string}) => Promise<boolean> | boolean;
}

export async function callGitHubApi(path: string, options: GitHubRequestOptions = {}): Promise<Response> {
  const token = getToken();
  const {params, maxAttempts = 3, retry = true, shouldRetry, headers: customHeaders, ...fetchOptions} = options;

  const url = buildGitHubUrl(path, params);
  const headers = new Headers({
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  });

  if (customHeaders) {
    new Headers(customHeaders).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  const attempts = retry ? maxAttempts : 1;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (isRateLimitStatus(response.status)) {
      await handleRateLimit(response);
      continue;
    }

    if (!response.ok) {
      if (attempt >= attempts) {
        throw new Error(`GitHub API request failed for ${url} (attempt ${attempt}/${attempts}) with status ${response.status}: ${response.statusText}`);
      }

      await wait(RETRY_DELAY_MS);
      continue;
    }

    if (retry && shouldRetry && attempt < attempts) {
      const shouldRetryResult = await shouldRetry({
        response: response.clone(),
        attempt,
        maxAttempts,
        url,
      });

      if (shouldRetryResult) {
        await wait(RETRY_DELAY_MS);
        continue;
      }
    }

    return response;
  }

  throw new Error(`GitHub API request failed after ${attempts} attempts for ${url}`);
}

function getToken(): string {
  const token = process.env.GITHUB_API_TOKEN;

  if (!token) {
    throw new Error("Missing GITHUB_API_TOKEN environment variable");
  }

  return token;
}

function buildGitHubUrl(path: string, params?: GitHubRequestParams): string {
  const baseUrl = path.startsWith("http") ? new URL(path) : new URL(path.startsWith("/") ? path : `/${path}`, GITHUB_API_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) return;
      baseUrl.searchParams.set(key, String(value));
    });
  }

  return baseUrl.toString();
}

function isRateLimitStatus(status: number) {
  return status === 403 || status === 429;
}

async function handleRateLimit(response: Response): Promise<void> {
  const resetAt = getRateLimitReset(response);
  if (resetAt) {
    const waitTime = Math.max(resetAt - Date.now(), 0) + RATE_LIMIT_PADDING_MS;
    console.warn(`Rate limited by GitHub (status ${response.status}). Waiting ${waitTime}ms until reset.`);
    await wait(waitTime);
    return;
  }

  const retryAfter = parseRetryAfter(response.headers.get("Retry-After"));
  if (retryAfter !== null) {
    console.warn(`Rate limited by GitHub (status ${response.status}). Waiting ${retryAfter}ms due to Retry-After header.`);
    await wait(retryAfter);
    return;
  }

  console.warn(`Rate limited by GitHub (status ${response.status}). Waiting ${RETRY_DELAY_MS}ms before retrying.`);
  await wait(RETRY_DELAY_MS);
}

function getRateLimitReset(response: Response): number | null {
  const headerValue = response.headers.get("X-RateLimit-Reset");
  if (!headerValue) return null;

  const epochSeconds = Number(headerValue);
  if (Number.isNaN(epochSeconds)) {
    return null;
  }

  return epochSeconds * 1000;
}

function parseRetryAfter(headerValue: string | null): number | null {
  if (!headerValue) return null;

  const numericValue = Number(headerValue);
  if (!Number.isNaN(numericValue)) {
    return numericValue * 1000;
  }

  const retryDate = new Date(headerValue);
  const waitTime = retryDate.getTime() - Date.now();
  return Number.isNaN(waitTime) ? null : Math.max(waitTime, 0);
}

function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}
