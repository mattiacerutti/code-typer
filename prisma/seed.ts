import dotenv from "dotenv";
import {PrismaClient} from "@prisma/client";
import {seedLanguages, SUPPORTED_LANGUAGES} from "./seed/languages";
import {seedSnippets} from "./seed/snippets";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  await seedLanguages(prisma);
  await seedSnippets(prisma, SUPPORTED_LANGUAGES);
  console.log("Snippets seeded successfully.");
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
