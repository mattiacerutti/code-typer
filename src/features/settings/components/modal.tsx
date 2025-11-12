import React from "react";
import useSettingsStore from "@/features/settings/stores/settings-store";
import {IoClose} from "react-icons/io5";
import {AutoClosingMode} from "../types/autoclosing-mode";

interface ISettingsModalProps {
  isOpen: boolean;
  closeModal?: () => void;
}

function SettingsModal(props: ISettingsModalProps) {
  const {isOpen = false, closeModal} = props;

  const autoClosingMode = useSettingsStore((state) => state.autoClosingMode);
  const setAutoClosing = useSettingsStore((state) => state.setAutoClosing);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1000 flex h-screen w-screen items-center justify-center bg-black/60" onClick={closeModal}>
      <div className="relative flex flex-col gap-4 rounded-md bg-(--color-background) px-6 py-3 font-medium text-(--color-foreground)" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button className="top-3 right-3 transition-colors hover:text-(--color-muted)" onClick={closeModal}>
            <IoClose size={24} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-4">
            Auto-Closing Mode
            <select
              value={autoClosingMode}
              onChange={(event) => {
                setAutoClosing(event.target.value as AutoClosingMode);
              }}
              className="rounded-md bg-(--color-surface) px-6 py-3 font-medium text-(--color-foreground)"
            >
              {Object.values(AutoClosingMode).map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
