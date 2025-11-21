import {createTRPCRouter} from "@/server/trpc/trpc";
import {snippetRouter} from "@/server/trpc/routers/snippet";

export const appRouter = createTRPCRouter({
  snippet: snippetRouter,
});

export type AppRouter = typeof appRouter;
