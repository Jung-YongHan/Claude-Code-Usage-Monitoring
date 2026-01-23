import { useState, useMemo, useEffect } from "react";
import { Keyboard, ChevronRight } from "lucide-react";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import {
  useKeyCapture,
  toBackendFormat,
  formatModifierDisplay,
  CapturedShortcut,
} from "../../hooks/useKeyCapture";

interface ShortcutSettingsProps {
  platformName: string;
  onNext: (modifier: string, key: string) => void;
}

type ShortcutMode = "platform_default" | "custom";

const PLATFORM_DEFAULTS: Record<string, { modifier: string; key: string; display: string }> = {
  macos: { modifier: "super+shift", key: "u", display: "Cmd+Shift+U" },
  linux: { modifier: "ctrl+shift", key: "u", display: "Ctrl+Shift+U" },
  windows: { modifier: "alt", key: "r", display: "Alt+R" },
};

export function ShortcutSettings({
  platformName,
  onNext,
}: ShortcutSettingsProps) {
  const [mode, setMode] = useState<ShortcutMode>("platform_default");
  const [customShortcut, setCustomShortcut] = useState<CapturedShortcut | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const { capturing, reset } = useKeyCapture({
    enabled: isCapturing,
    onCapture: (shortcut) => {
      setCustomShortcut(shortcut);
      setIsCapturing(false);
    },
  });

  const platformDefault = PLATFORM_DEFAULTS[platformName] || PLATFORM_DEFAULTS.linux;

  // Adjust window height based on mode
  useEffect(() => {
    const adjustHeight = async () => {
      const win = getCurrentWindow();
      let height = 360;
      if (mode === "custom") {
        height = customShortcut ? 470 : 440;
      }
      console.log("ShortcutSettings adjustHeight:", mode, height);
      try {
        await win.setSize(new LogicalSize(380, height));
        console.log("setSize success");
      } catch (e) {
        console.error("setSize error:", e);
      }
    };
    adjustHeight();
  }, [mode, customShortcut]);

  const isNextEnabled = useMemo(() => {
    if (mode === "platform_default") return true;
    if (!customShortcut) return false;
    return customShortcut.modifiers.length > 0 && customShortcut.key.length === 1;
  }, [mode, customShortcut]);

  const handleNext = () => {
    if (mode === "platform_default") {
      onNext(platformDefault.modifier, platformDefault.key);
    } else if (customShortcut) {
      const backend = toBackendFormat(customShortcut);
      onNext(backend.modifier, backend.key);
    }
  };

  const handleModeChange = (newMode: ShortcutMode) => {
    setMode(newMode);
    if (newMode === "platform_default") {
      setIsCapturing(false);
      reset();
    }
  };

  const handleStartCapture = () => {
    setCustomShortcut(null);
    reset();
    setIsCapturing(true);
  };

  return (
    <div className="p-5 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <Keyboard className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-200">
            단축키 설정
          </h2>
          <p className="text-xs text-slate-400">
            오버레이를 토글할 단축키를 선택하세요
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Platform Default Option */}
        <button
          onClick={() => handleModeChange("platform_default")}
          className={`w-full p-3 rounded-lg text-left transition-all ${
            mode === "platform_default"
              ? "bg-blue-600/20 border-2 border-blue-500"
              : "bg-slate-800/50 border-2 border-slate-700 hover:border-slate-600"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                mode === "platform_default"
                  ? "border-blue-500"
                  : "border-slate-500"
              }`}
            >
              {mode === "platform_default" && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
            <span className="text-sm font-medium text-slate-200">
              플랫폼 기본값 사용
            </span>
            <span className="text-xs text-slate-500 ml-auto">권장</span>
          </div>
          <div className="mt-2 ml-6">
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-slate-700/50 text-slate-300 rounded">
              {platformDefault.display}
            </span>
          </div>
        </button>

        {/* Custom Option */}
        <button
          onClick={() => handleModeChange("custom")}
          className={`w-full p-3 rounded-lg text-left transition-all ${
            mode === "custom"
              ? "bg-blue-600/20 border-2 border-blue-500"
              : "bg-slate-800/50 border-2 border-slate-700 hover:border-slate-600"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                mode === "custom" ? "border-blue-500" : "border-slate-500"
              }`}
            >
              {mode === "custom" && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
            <span className="text-sm font-medium text-slate-200">직접 입력</span>
          </div>
        </button>

        {/* Custom Input Area */}
        {mode === "custom" && (
          <div className="ml-6">
            <p className="text-[11px] text-slate-500 mb-2">
              Modifier 키(Cmd/Ctrl/Alt/Shift) + 알파벳 키 조합만 지원됩니다
            </p>
            <button
              onClick={handleStartCapture}
              className={`w-full px-4 py-3 text-sm rounded-lg transition-all text-center ${
                capturing || isCapturing
                  ? "bg-blue-600/20 border-2 border-blue-500 text-blue-400"
                  : "bg-slate-700/80 text-slate-200 hover:bg-slate-600 border-2 border-transparent"
              }`}
            >
              {capturing || isCapturing ? (
                <span className="animate-pulse">키를 동시에 누르세요...</span>
              ) : customShortcut ? (
                <div className="flex items-center justify-center gap-1.5">
                  {customShortcut.modifiers.map((m) => (
                    <span
                      key={m}
                      className="px-2 py-0.5 text-xs font-mono bg-slate-600 text-slate-200 rounded"
                    >
                      {formatModifierDisplay(m, platformName)}
                    </span>
                  ))}
                  <span className="text-slate-400">+</span>
                  <span className="px-2 py-0.5 text-xs font-mono bg-slate-600 text-slate-200 rounded">
                    {customShortcut.key}
                  </span>
                </div>
              ) : (
                "클릭 후 단축키 입력"
              )}
            </button>
            {customShortcut && (
              <p className="text-[11px] text-slate-500 mt-2 text-center">
                다시 설정하려면 위 영역을 클릭하세요
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <button
          onClick={handleNext}
          disabled={!isNextEnabled}
          className="w-full flex items-center justify-center gap-1 px-4 py-3 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg transition-colors font-medium"
        >
          다음
          <ChevronRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-slate-500 text-center">
          나중에 설정에서 변경할 수 있습니다
        </p>
      </div>
    </div>
  );
}
