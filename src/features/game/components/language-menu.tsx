import {useEffect, useMemo, useRef, useState} from "react";
import type {ILanguage} from "@/shared/types/language";
import {IoChevronDownOutline} from "react-icons/io5";

interface LanguageMenuProps {
  languages: ILanguage[];
  selectedLanguageId: string;
  disabled?: boolean;
  onSelect: (language: ILanguage) => void;
}

function LanguageMenu(props: LanguageMenuProps) {
  const {languages, selectedLanguageId, disabled = false, onSelect} = props;

  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedLanguage = useMemo(() => languages.find((language) => language.id === selectedLanguageId) ?? languages[0], [languages, selectedLanguageId]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (language: ILanguage) => {
    setIsOpen(false);
    if (language.id === selectedLanguageId) return;
    onSelect(language);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        type="button"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3 text-left text-sm font-semibold text-black shadow-sm transition hover:border-black/30 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500">Language</span>
          <span className="text-base font-semibold text-black">{selectedLanguage?.name ?? "Select a language"}</span>
        </div>
        <IoChevronDownOutline className={`text-lg transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <div
        className={`absolute left-0 right-0 top-full z-20 mt-2 origin-top rounded-3xl border border-black/10 bg-white p-3 shadow-xl transition-all duration-200 ${
          isOpen ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-2">
          {languages.map((language) => {
            const isActive = language.id === selectedLanguageId;
            return (
              <button
                key={language.id}
                type="button"
                onClick={() => handleSelect(language)}
                className={`flex w-full flex-col rounded-xl border border-black/10 px-4 py-3 text-left transition ${
                  isActive ? "bg-black text-white" : "bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <span className="text-sm font-semibold">{language.name}</span>
                <span className="text-xs text-zinc-500">{language.extensions.map((extension) => `.${extension}`).join(" ") || "Language stack"}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LanguageMenu;
