import React from "react";
import useSettingsStore from "@/features/settings/stores/settings-store";
import {IoClose} from "react-icons/io5";

interface ISettingsModalProps {
  isOpen: boolean;
  closeModal?: () => void;
}

function SettingsModal(props: ISettingsModalProps) {
  const {isOpen = false, closeModal} = props;

  const autoClosingEnabled = useSettingsStore((state) => state.autoClosingEnabled);
  const setAutoClosing = useSettingsStore((state) => state.setAutoClosing);

  if (!isOpen) return null;

  return (
    <div className="absolute z-100 flex h-screen w-screen items-center justify-center bg-black/60" onClick={closeModal}>
      <div className="relative flex flex-col gap-4 rounded-md bg-slate-200 px-6 py-3 font-medium text-slate-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button className="top-3 right-3 hover:text-slate-600" onClick={closeModal}>
            <IoClose size={24} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-4">
            Enable Auto-Closing Brackets
            <input type="checkbox" checked={autoClosingEnabled} onChange={(e) => setAutoClosing(e.target.checked)} />
          </label>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
