import {fetchRequestHandler} from "@trpc/server/adapters/fetch";
import {NextRequest} from "next/server";
import {appRouter} from "@/server/trpc/routers";
import {createTRPCContext} from "@/server/trpc/context";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({req}),
  });

export {handler as GET, handler as POST};
