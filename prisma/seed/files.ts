import {PrismaClient} from "@prisma/client";
import {getFilesForLanguage} from "../../lib/snippet-helpers";
import {SUPPORTED_LANGUAGES} from "./languages";

export async function seedFiles(prisma: PrismaClient) {
  console.log("Seeding files for supported languages...");
  const languages = await prisma.language.findMany({
    select: {
      id: true,
      _count: {select: {trackedFiles: true}},
    },
  });

  if (languages.length === 0) {
    throw new Error("Language table is empty. Run the base seed first: ts-node prisma/seed.ts");
  }

  const missingLanguageIds = languages.filter((language) => language._count.trackedFiles === 0).map((language) => language.id);

  if (missingLanguageIds.length === 0) {
    console.log("All languages already have snippets.");
    return;
  }

  console.log(`Seeding snippets for missing languages: ${missingLanguageIds.join(", ")}`);

  for (const languageId of missingLanguageIds) {
    await seedFilesForLanguage(prisma, languageId);
  }

  console.log("Finished seeding files for all missing languages.");
}

async function seedFilesForLanguage(prisma: PrismaClient, languageId: string) {
  const language = SUPPORTED_LANGUAGES.find((lang) => lang.id === languageId);
  if (!language) {
    throw new Error(`Language with ID ${languageId} is not supported.`);
  }

  console.log(`Fetching files for language: ${language.name}`);
  const files = await getFilesForLanguage(language);

  for (const file of files) {
    const insertedFile = await prisma.file.create({
      data: {
        repository: file.repository,
        path: file.path,
        languageId: language.id,
      },
    });

    await prisma.fileVersion.create({
      data: {
        sha: file.sha,
        commit: file.commit,
        fileId: insertedFile.id,
      },
    });
  }

  console.log(`Seeded ${files.length} files for language: ${language.name}`);
}
