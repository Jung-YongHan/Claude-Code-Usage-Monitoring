import { Minus, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function TitleBar() {
  const appWindow = getCurrentWindow();

  return (
    <div
      data-tauri-drag-region
      className="h-7 bg-slate-900 flex items-center justify-between px-2 select-none"
    >
      <div className="flex items-center gap-1.5" data-tauri-drag-region>
        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
        <span className="text-[10px] font-medium text-slate-400">
          Claude Usage
        </span>
      </div>

      <div className="flex items-center">
        <button
          onClick={() => appWindow.minimize()}
          className="w-6 h-6 flex items-center justify-center hover:bg-slate-800 transition-colors rounded"
        >
          <Minus className="w-3 h-3 text-slate-400" />
        </button>
        <button
          onClick={() => appWindow.close()}
          className="w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors rounded"
        >
          <X className="w-3 h-3 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
