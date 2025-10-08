import React from "react";

function GameLayout({children}: {children: React.ReactNode}) {
  return <div className="flex h-screen w-screen flex-col items-center justify-center">{children}</div>;
}

export default GameLayout;
