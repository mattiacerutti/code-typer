import dotenv from "dotenv";
import {PrismaClient} from "@prisma/client";
import {parseNumberFlag} from "./utils/cli";
import {seedLanguageSnippets} from "./utils/snippet-helpers";

dotenv.config();

const prisma = new PrismaClient();
const rawArgs = process.argv.slice(2);

interface CliOptions {
  pagesPerLanguage?: number;
}

function parseCliOptions(): CliOptions {
  const pagesPerLanguage = parseNumberFlag(rawArgs, "--pages");
  return {pagesPerLanguage};
}

async function seedMissingLanguageSnippets(pagesPerLanguage?: number) {
  const languages = await prisma.language.findMany({
    select: {
      id: true,
      _count: {select: {snippets: true}},
    },
  });

  if (languages.length === 0) {
    console.warn("Language table is empty. Run the base seed first: ts-node prisma/seed.ts");
    return;
  }

  const missingLanguageIds = languages.filter((language) => language._count.snippets === 0).map((language) => language.id);

  if (missingLanguageIds.length === 0) {
    console.log("All languages already have snippets.");
    return;
  }

  console.log(`Seeding snippets for missing languages: ${missingLanguageIds.join(", ")}`);

  for (const languageId of missingLanguageIds) {
    await seedLanguageSnippets(prisma, languageId, pagesPerLanguage);
  }
}

async function main() {
  const options = parseCliOptions();
  await seedMissingLanguageSnippets(options.pagesPerLanguage);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
