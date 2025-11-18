import {PrismaClient} from "@prisma/client";
import prismaRandom from "prisma-extension-random";

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

const createPrisma = () => {
  const base = new PrismaClient({
    log: ["error", "warn"],
  });
  const extended = base.$extends(prismaRandom());
  return extended;
};

export type ExtendedPrismaClient = ReturnType<typeof createPrisma>;

export const prisma: ExtendedPrismaClient = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
