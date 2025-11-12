"use client";

import {ThemeProvider as NextThemesProvider, type ThemeProviderProps} from "next-themes";

function ThemeProvider({children, ...props}: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="data-theme" defaultTheme="system" enableSystem {...props}>
      {children}
    </NextThemesProvider>
  );
}

export default ThemeProvider;
