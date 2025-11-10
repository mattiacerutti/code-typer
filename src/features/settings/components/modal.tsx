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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={closeModal}>
      <div className="relative w-full max-w-sm rounded-2xl border border-black/10 bg-white px-6 py-6 text-zinc-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Settings</p>
            <h2 className="mt-1 text-xl font-semibold text-black">Adjust your run</h2>
          </div>
          <button className="rounded-full p-1 text-zinc-500 hover:text-black" onClick={closeModal}>
            <IoClose size={18} />
          </button>
        </div>
        <label className="mt-6 flex flex-col gap-2 text-sm text-zinc-600">
          Auto-closing mode
          <select
            value={autoClosingMode}
            onChange={(event) => {
              setAutoClosing(event.target.value as AutoClosingMode);
            }}
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black"
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
  );
}

export default SettingsModal;
