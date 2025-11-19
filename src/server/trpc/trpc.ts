import {TRPCError, initTRPC} from "@trpc/server";
import {rateLimit} from "@/core/middleware/rate-limiter";
import type {TRPCContext} from "./context";

const t = initTRPC.context<TRPCContext>().create();

const rateLimitMiddleware = t.middleware(({ctx, next}) => {
  if (rateLimit(ctx.req)) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests, please slow down.",
    });
  }

  return next();
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const rateLimitedProcedure = publicProcedure.use(rateLimitMiddleware);
export const mergeTRPCRouters = t.mergeRouters;
