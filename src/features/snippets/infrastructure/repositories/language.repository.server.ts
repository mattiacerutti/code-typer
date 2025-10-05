import { ILanguage } from "@/shared/types/language";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function doesLanguageExist(languageId: string): Promise<boolean> {
  const language = await prisma.language.findUnique({
    where: {
      id: languageId,
    },
  });

  return language !== null;
}

export async function getLanguages(): Promise<{
  [key: string]: ILanguage;
}> {
  const languages = await prisma.language.findMany();
  return languages.reduce((acc, language) => {
    acc[language.id] = language;
    return acc;
  }, {} as {[key: string]: ILanguage});
}
