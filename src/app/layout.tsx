import Script from "next/script";
import "./globals.css";
import ThemeProvider from "@/shared/components/theme-provider";
import {TRPCReactProvider} from "@/trpc/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>{process.env.NODE_ENV === "production" && <Script defer src="https://cloud.umami.is/script.js" data-website-id="5776b2c7-d9cd-424b-a233-b9ed0287d324" />}</head>
      <body>
        <TRPCReactProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
