import {TRPCError} from "@trpc/server";
import {z} from "zod";
import {createTRPCRouter, publicProcedure} from "@/server/trpc/trpc";
import {getRandomSnippets} from "@/features/snippets/services/get-random-snippets.server";
import {doesLanguageExist, getLanguages} from "@/features/snippets/infrastructure/repositories/language.repository.server";

export const snippetRouter = createTRPCRouter({
  languages: publicProcedure.query(async () => {
    return getLanguages();
  }),
  random: publicProcedure
    .input(
      z.object({
        languageId: z.string().min(1),
      })
    )
    .mutation(async ({input}) => {
      const languageId = input.languageId.toLowerCase();
      const languageExists = await doesLanguageExist(languageId);

      if (!languageExists) {
        throw new TRPCError({code: "NOT_FOUND", message: "Language not found"});
      }

      return getRandomSnippets(languageId);
    }),
});
