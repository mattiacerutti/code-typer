import dotenv from "dotenv";
import {PrismaClient} from "@prisma/client";
import {seedLanguages} from "./seed/languages";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  await seedLanguages(prisma);
  console.log("Languages seeded successfully.");
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
