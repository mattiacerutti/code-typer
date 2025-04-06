import {ILanguage} from "@/types/language";
import {PrismaClient} from "@prisma/client";
import {fetchLanguageSnippets} from "../scripts/fetch-snippets";

const prisma = new PrismaClient();

export const SUPPORTED_LANGUAGES: ILanguage[] = [
  {
    id: "js",
    name: "JavaScript",
    extensions: ["js", "jsx"],
    highlightAlias: "javascript",
  },
  {
    id: "ts",
    name: "TypeScript",
    extensions: ["ts", "tsx"],
    highlightAlias: "typescript",
  },
  {
    id: "c",
    name: "C",
    extensions: ["c"],
    highlightAlias: "cpp",
  },
  {
    id: "cpp",
    name: "C++",
    extensions: ["cpp"],
    highlightAlias: "cpp",
  },
  {
    id: "cs",
    name: "C#",
    extensions: ["cs"],
    highlightAlias: "csharp",
  },
  {
    id: "java",
    name: "Java",
    extensions: ["java"],
    highlightAlias: "java",
  },
  {
    id: "py",
    name: "Python",
    extensions: ["py"],

    highlightAlias: "python",
  },
  {
    id: "lua",
    name: "Lua",
    extensions: ["lua"],
    highlightAlias: "lua",
  },
];

async function seedSnippets() {
  for (const language of SUPPORTED_LANGUAGES) {
    let i = 0;
    while (i < 10) {
      try {
        const snippets = await fetchLanguageSnippets(language, i);
        for (const snippet of snippets) {
          await prisma.snippet.create({
            data: {
              url: snippet,
              language: {
                connect: {
                  id: language.id,
                },
              },
            },
          });
        }
        i++;
      } catch (error) {
        console.error(`Error fetching snippets for ${language.name} on page ${i}: ${error}`);
      }
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

    console.log(`Created language: ${createdLanguage.name} successfully.`);
  }
  await seedSnippets();
  console.log("Snippets seeded successfully.");
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
