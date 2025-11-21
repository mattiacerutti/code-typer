import {prisma} from "@/server/prisma";
import {Snippet} from "@prisma/client";

export async function findRandomSnippets(languageId: string, quantity: number): Promise<Pick<Snippet, "id" | "content">[]> {
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
