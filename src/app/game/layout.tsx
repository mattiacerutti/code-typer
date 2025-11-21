import React from "react";
import Link from "next/link";
import {FaGithub} from "react-icons/fa";
import ThemeToggle from "@/components/theme-toggle";

function GameLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex min-h-screen w-screen flex-col">
      <main className="flex w-full flex-1 flex-col items-center justify-center">
        <div className="max-xl:hidden">{children}</div>
        <p className="px-10 text-center text-lg xl:hidden">Website doesn&apos;t yet support mobile. Please visit using a desktop device.</p>
      </main>
      <footer className="flex items-center justify-center py-4 text-sm text-(--color-muted)">
        <div className="relative inline-flex items-center justify-center">
          <Link href="https://github.com/mattiacerutti/code-typer" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-(--color-foreground)">
            <FaGithub className="text-lg" />
            <span>Star it on GitHub ⭐</span>
          </Link>
          <div className="absolute top-0 left-full ml-4">
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default GameLayout;
