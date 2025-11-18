import {getSnippetsFromFile} from "@lib/snippets";
import {Prisma, PrismaClient} from "@prisma/client";
import pLimit from "p-limit";

const RAW_GITHUB_BASE_URL = "https://raw.githubusercontent.com";
const limit = pLimit(100);

export async function seedSnippets(prisma: PrismaClient) {
  console.log("Seeding snippets for unparsed files..");
  const unparsedFiles = await prisma.fileVersion.findMany({
    select: {
      id: true,
      file: {
        select: {
          repository: true,
          path: true,
          languageId: true,
        },
      },
      commit: true,
    },
    where: {
      parsedAt: null,
    },
  });

  if (unparsedFiles.length === 0) {
    console.log("All files are parsed. No snippets to seed.");
    return;
  }

  await Promise.all(
    unparsedFiles.map(async (file) => {
      const {repository, path, languageId} = file.file;
      const url = `${RAW_GITHUB_BASE_URL}/${repository}/${file.commit}/${path}`;

      const fileContent = await limit(async () => {
        const res = await fetch(url).catch((error) => {
          console.warn(`Could not fetch file content from ${url}:`, error);
          return null;
        });

        if (!res) return null;

        if (!res.ok) {
          if (res.status === 404 || res.status === 400) {
            await prisma.fileVersion.delete({
              where: {id: file.id},
            });
            console.warn(`Deleted file version ${file.id} due to 404 (file missing).`);
          }
          return null;
        }

        return res.text();
      });

      if (!fileContent) return;

      const snippets = getSnippetsFromFile(fileContent, languageId);

      await Promise.all(
        snippets.map(async (snippet) => {
          try {
            await prisma.snippet.create({
              data: {
                sha: snippet.sha,
                content: snippet.content,
                rawContent: snippet.rawContent,
                fileVersionId: file.id,
              },
            });
          } catch (error) {
            // Ignore unique constraint violation (since multiple files can produce the same snippet). Upsert is not an option since we are seeding in parallel.
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return;
            throw error;
          }
        })
      );

      await prisma.fileVersion.update({
        where: {id: file.id},
        data: {parsedAt: new Date()},
      });
    })
  );

  console.log("Finished seeding snippets for all unparsed files.");
}
