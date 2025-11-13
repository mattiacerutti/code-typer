"use client";

import {useTheme} from "next-themes";

export default function HighlightTheme() {
  const {resolvedTheme} = useTheme();

  const href =
    resolvedTheme === "dark"
      ? "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.css"
      : "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.css";

  return <link rel="stylesheet" href={href} />;
}
