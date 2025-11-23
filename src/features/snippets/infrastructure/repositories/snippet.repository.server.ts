import {prisma} from "@/server/prisma";

export async function findRandomSnippets(languageId: string, quantity: number) {
  const snippets = await prisma.snippet.findManyRandom(quantity, {
    select: {
      id: true,
      content: true,
    },
    where: {
      fileVersion: {
        file: {
          languageId,
        },
      },
    },
  });

  return snippets;
}

export async function findSnippetById(snippetId: string) {
  const snippet = await prisma.snippet.findUnique({
    where: {
      id: snippetId,
    },
    select: {
      id: true,
      content: true,
      fileVersion: {
        select: {
          file: {
            select: {
              languageId: true,
            },
          },
        },
      },
    },
  });

  if (!snippet) return null;

  return {
    id: snippet.id,
    content: snippet.content,
    languageId: snippet.fileVersion.file.languageId,
  };
}
