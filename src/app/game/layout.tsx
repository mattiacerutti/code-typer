import React from "react";
import Link from "next/link";
import {FaGithub} from "react-icons/fa";

function GameLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center px-4 py-8">
      <main className="flex w-full max-w-5xl flex-col items-center justify-center gap-6">{children}</main>
      <footer className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
        <Link
          href="https://github.com/mattiacerutti/code-typer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-slate-900"
        >
          <FaGithub className="text-lg" />
          <span>GitHub</span>
        </Link>
      </footer>
    </div>
  );
}

export default GameLayout;
