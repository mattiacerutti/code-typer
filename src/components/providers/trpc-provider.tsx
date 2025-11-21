"use client";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {httpBatchLink} from "@trpc/client";
import {createTRPCReact} from "@trpc/react-query";
import {ReactNode, useState} from "react";
import type {AppRouter} from "@/server/trpc/routers";

export const api = createTRPCReact<AppRouter>();

export function TRPCReactProvider({children}: {children: ReactNode}) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          headers() {
            return {
              "x-internal-api": "true",
            };
          },
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
}
