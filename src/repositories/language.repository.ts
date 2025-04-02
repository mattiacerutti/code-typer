import { LanguageId } from "@/types/language";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function doesLanguageExist(languageId: LanguageId): Promise<boolean> {
  const language = await prisma.language.findUnique({
    where: {
      id: languageId,
    },
  });

  return language !== null;
}
