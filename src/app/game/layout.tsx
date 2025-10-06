import React from "react";

function GameLayout({children}: {children: React.ReactNode}) {
  return <div className="w-screen h-screen flex justify-center items-center flex-col">{children}</div>;
}

export default GameLayout;
