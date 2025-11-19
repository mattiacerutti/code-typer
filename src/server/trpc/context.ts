import {NextRequest} from "next/server";

export type CreateContextOptions = {
  req: NextRequest;
};

export async function createTRPCContext({req}: CreateContextOptions) {
  return {
    req,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
