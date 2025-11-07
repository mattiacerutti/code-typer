import {ILanguage} from "@/shared/types/language";
import {create} from "zustand";
import {persist} from "zustand/middleware";
import {AutoClosingMode} from "@/features/settings/types/autoclosing-mode";

interface ISettingsStoreState {
  autoClosingMode: AutoClosingMode;
  selectedLanguage: ILanguage | null;
  setAutoClosing: (mode: AutoClosingMode) => void;
  setSelectedLanguage: (language: ILanguage) => void;
}

const useSettingsStore = create(
  persist<ISettingsStoreState>(
    (set) => ({
      autoClosingMode: AutoClosingMode.PARTIAL,
      selectedLanguage: null,
      setAutoClosing: (mode: AutoClosingMode) => set({autoClosingMode: mode}),
      setSelectedLanguage: (language: ILanguage) => set({selectedLanguage: language}),
    }),
    {name: "settings-storage"}
  )
);

export default useSettingsStore;
