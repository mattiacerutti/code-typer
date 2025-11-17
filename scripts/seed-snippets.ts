import dotenv from "dotenv";
import {PrismaClient} from "@prisma/client";
import {getFlagValue, parseNumberFlag} from "./utils/cli";
import {getFilesForLanguage} from "../lib/snippet-helpers";

dotenv.config();

const rawArgs = process.argv.slice(2);

interface CliOptions {
  languageId: string;
  pagesPerLanguage?: number;
}

function parseCliOptions(): CliOptions {
  const languageId = getFlagValue(rawArgs, "--language");

  if (!languageId) {
    throw new Error("Missing --language flag. Example: ts-node scripts/seed-snippets.ts --language js");
  }

  const pagesPerLanguage = parseNumberFlag(rawArgs, "--pages");

  return {languageId, pagesPerLanguage};
}

if (require.main === module) {
  (async () => {
    const prisma = new PrismaClient();
    try {
      const options = parseCliOptions();
      await seedLanguageSnippetsHelper(prisma, options.languageId, options.pagesPerLanguage);
      await prisma.$disconnect();
    } catch (error) {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    }
  })();
}
