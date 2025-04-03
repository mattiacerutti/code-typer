import {PrismaClient} from "@prisma/client";
const prisma = new PrismaClient();

export async function fetchRandomSnippets(languageId: string, quantity: number, alreadyFetched: string[]): Promise<string[]> {
  const alreadyFetchedList = alreadyFetched.length > 0 ? `AND "url" NOT IN (${alreadyFetched.map((_, i) => `$${i + 2}`).join(", ")})` : "";

  const query = `
    SELECT "url" FROM "Snippet"
    WHERE "languageId" = $1
    ${alreadyFetchedList}
    ORDER BY RANDOM()
    LIMIT $${alreadyFetched.length + 2};
  `;

  const snippets = await prisma.$queryRawUnsafe(query, languageId, ...alreadyFetched, quantity) as {url: string}[];

  return snippets.map((snippet) => snippet.url);
}

export async function setSnippetAsNonValid(url: string) {
  await prisma.snippet.update({
    where: {url},
    data: {isValid: false},
  });
}
