import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={"min-h-[100vh] m-0 bg-white col-[#0f172a]"}
      >{children}</body>
    </html>
  );
}
