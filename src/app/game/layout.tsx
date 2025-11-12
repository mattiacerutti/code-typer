import React from "react";
import Link from "next/link";
import {FaGithub} from "react-icons/fa";

function GameLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex min-h-screen w-screen flex-col">
      <main className="flex w-full flex-1 flex-col items-center justify-center">
        <div className="max-xl:hidden">{children}</div>
        <p className="px-10 text-center text-lg xl:hidden">Website doesn&apos;t yet support mobile. Please visit using a desktop device.</p>
      </main>
      <footer className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
        <Link href="https://github.com/mattiacerutti/code-typer" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-slate-900">
          <FaGithub className="text-lg" />
          <span>GitHub</span>
        </Link>
      </footer>
    </div>
  );
}

export default GameLayout;
