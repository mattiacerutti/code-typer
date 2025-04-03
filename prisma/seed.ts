import {ILanguage as ILanguageType} from "@/types/language";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();
const GITHUB_API_URL = "https://api.github.com";
const TOKEN = process.env.GITHUB_API_TOKEN;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSnippetRawLink(data: any): string {
  const baseUrl = "https://raw.githubusercontent.com";

  const repository = data.repository.full_name;
  const sha = data.url.split("?ref=")[1];
  const path = data.path;

  return `${baseUrl}/${repository}/${sha}/${path}`;
}

export enum Language {
  JAVASCRIPT = "JavaScript",
  TYPESCRIPT = "TypeScript",
  C = "C",
  CPP = "C++",
  CSHARP = "C#",
  JAVA = "Java",
  PYTHON = "Python",
  LUA = "Lua",
}

type ILanguage = ILanguageType & {id: string};

export const SUPPORTED_LANGUAGES: Record<Language, ILanguage> = {
  [Language.JAVASCRIPT]: {
    id: "js",
    name: Language.JAVASCRIPT,
    extensions: ["js", "jsx"],
    highlightAlias: "javascript",
  },
  [Language.TYPESCRIPT]: {
    id: "ts",
    name: Language.TYPESCRIPT,
    extensions: ["ts", "tsx"],
    highlightAlias: "typescript",
  },
  [Language.C]: {
    id: "c",
    name: Language.C,
    extensions: ["c"],
    highlightAlias: "cpp",
  },
  [Language.CPP]: {
    id: "cpp",
    name: Language.CPP,
    extensions: ["cpp"],
    highlightAlias: "cpp",
  },
  [Language.CSHARP]: {
    id: "cs",
    name: Language.CSHARP,
    extensions: ["cs"],
    highlightAlias: "csharp",
  },
  [Language.JAVA]: {
    id: "java",
    name: Language.JAVA,
    extensions: ["java"],
    highlightAlias: "java",
  },
  [Language.PYTHON]: {
    id: "py",
    name: Language.PYTHON,
    extensions: ["py"],
    highlightAlias: "python",
  },
  [Language.LUA]: {
    id: "lua",
    name: Language.LUA,
    extensions: ["lua"],
    highlightAlias: "lua",
  },
};

async function fetchLanguageSnippets(language: ILanguage, page: number): Promise<string[]> {
  const extensionsFilter = language.extensions.map((extension) => `extension:${extension}`).join(" ");

  const params = new URLSearchParams({
    q: `language:${language.name} size:>3000 ${extensionsFilter}`,
    page: page.toString(),
    per_page: "100",
  });

  const request = async () => {
    await enforceRateLimit();
    return fetch(`${GITHUB_API_URL}/search/code?${params}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
  };

  let response = await request();
  let responseJson = await response.json();

  if(response.status !== 200){
    console.error(`Request 1 was not successful: ${response.statusText}. The request was: ${params}`);
  }

  if (responseJson.items.length === 0) {
    response = await request();
    responseJson = await response.json();

    if(response.status !== 200){
      console.error(`Request 2 was not successful: ${response.statusText}. The request was: ${params}`);
    }
  }

  if (responseJson.items.length === 0) {
    console.error("All requests were successful but the items array was empty for two times in a row");
    return [];
  }

  console.log(`Fetched ${responseJson.items.length} snippets for ${language.name} on page ${page}`);

  return responseJson.items.map((item: unknown) => getSnippetRawLink(item));
}

const REQUEST_LOG: number[] = [];
const MAX_REQUESTS = 9;
const INTERVAL = 61 * 1000; // 1 minute

async function enforceRateLimit(): Promise<void> {
  const now = Date.now();

  // Remove timestamps older than 1 minute
  while (REQUEST_LOG.length > 0 && now - REQUEST_LOG[0] > INTERVAL) {
    REQUEST_LOG.shift();
  }

  if (REQUEST_LOG.length >= MAX_REQUESTS) {
    const waitTime = INTERVAL - (now - REQUEST_LOG[REQUEST_LOG.length - 1]);
    console.log(`Waiting for ${waitTime}ms to enforce rate limit`);
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  REQUEST_LOG.push(Date.now());
}

async function seedSnippets(){
  for (const language of Object.values(SUPPORTED_LANGUAGES)) {
    for(let page = 1; page <= 10; page++){
      const snippets = await fetchLanguageSnippets(language, page);
      for (const snippet of snippets) {
        try {
          await prisma.snippet.create({
            data: {
              url: snippet,
            language: {
              connect: {
                id: language.id,
              },
            },
            isValid: true,
            },
          });
        } catch (error) {
          console.error(`Error creating snippet: ${snippet} for ${language.name} on page ${page}. Error: ${error}`);
        }
      }
      console.log(`Created ${snippets.length} snippets for ${language.name} on page ${page}`);
    }
  }
}

async function main() {
  for (const language of Object.values(SUPPORTED_LANGUAGES)) {
    const createdLanguage = await prisma.language.create({
      data: {
        id: language.id,
        name: language.name,
        extensions: language.extensions,
        highlightAlias: language.highlightAlias,
      },
    });

    
    console.log(`Created language: ${createdLanguage.name} successfully`);
  }
  await seedSnippets();
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
