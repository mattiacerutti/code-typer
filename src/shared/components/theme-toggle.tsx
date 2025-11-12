"use client";

import {useEffect, useState} from "react";
import {FiMoon, FiSun} from "react-icons/fi";
import {useTheme} from "next-themes";

function ThemeToggle() {
  const {resolvedTheme, setTheme} = useTheme();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    if (!isMounted) return;
    setTheme(isDark ? "light" : "dark");
  };

  if (!isMounted) return null;

  return (
    <button
      className="inline-flex cursor-pointer items-center justify-center leading-none transition duration-400 hover:text-(--foreground)"
      onClick={handleToggle}
      onMouseDown={(e) => e.preventDefault()}
    >
      <span className="relative block h-5 w-5 shrink-0">
        <FiSun
          className={
            "pointer-events-none absolute inset-0 h-5 w-5 origin-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " +
            (isDark ? "scale-90 rotate-[-60deg] opacity-0" : "scale-100 rotate-0 opacity-100")
          }
        />
        <FiMoon
          className={
            "pointer-events-none absolute inset-0 h-5 w-5 origin-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " +
            (isDark ? "scale-100 rotate-0 opacity-100" : "scale-90 rotate-60 opacity-0")
          }
        />
        <span className="sr-only">{isDark ? "Switch to light" : "Switch to dark"}</span>
      </span>
    </button>
  );
}

export default ThemeToggle;
