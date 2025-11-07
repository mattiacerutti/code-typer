import {ILanguage} from "@/shared/types/language";
import {create} from "zustand";
import {persist} from "zustand/middleware";

interface ISettingsStoreState {
  autoClosingEnabled: boolean;
  selectedLanguage: ILanguage | null;
  setAutoClosing: (enabled: boolean) => void;
  setSelectedLanguage: (language: ILanguage) => void;
}

const useSettingsStore = create(
  persist<ISettingsStoreState>(
    (set) => ({
      autoClosingEnabled: true,
      selectedLanguage: null,
      setAutoClosing: (enabled: boolean) => set({autoClosingEnabled: enabled}),
      setSelectedLanguage: (language: ILanguage) => set({selectedLanguage: language}),
    }),
    {name: "settings-storage"}
  )
);

export default useSettingsStore;
