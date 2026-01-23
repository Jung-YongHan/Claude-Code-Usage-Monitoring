import { useState, useEffect, useCallback, useRef } from "react";

const CAPTURE_WINDOW_MS = 150;
const MODIFIER_KEYS = ["Meta", "Control", "Alt", "Shift"];

export interface CapturedShortcut {
  modifiers: string[];
  key: string;
}

interface UseKeyCaptureOptions {
  enabled: boolean;
  onCapture?: (shortcut: CapturedShortcut) => void;
}

export function useKeyCapture({ enabled, onCapture }: UseKeyCaptureOptions) {
  const [capturing, setCapturing] = useState(false);
  const [result, setResult] = useState<CapturedShortcut | null>(null);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captureStartedRef = useRef(false);

  const finalize = useCallback(() => {
    const keys = Array.from(pressedKeysRef.current);
    const modifiers = keys.filter((k) => MODIFIER_KEYS.includes(k));
    const letterKeys = keys.filter((k) => /^[a-zA-Z]$/.test(k));

    if (modifiers.length > 0 && letterKeys.length === 1) {
      const newResult: CapturedShortcut = {
        modifiers,
        key: letterKeys[0].toUpperCase(),
      };
      setResult(newResult);
      onCapture?.(newResult);
    }

    pressedKeysRef.current.clear();
    setCapturing(false);
    captureStartedRef.current = false;
  }, [onCapture]);

  const reset = useCallback(() => {
    setResult(null);
    pressedKeysRef.current.clear();
    setCapturing(false);
    captureStartedRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      reset();
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // If capture already finished and new key comes, reset and start new capture
      if (!captureStartedRef.current) {
        pressedKeysRef.current.clear();
        setResult(null);
        captureStartedRef.current = true;
        setCapturing(true);
      }

      pressedKeysRef.current.add(e.key);

      // Reset timer on each new key
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(finalize, CAPTURE_WINDOW_MS);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, finalize, reset]);

  return { capturing, result, reset };
}

export function toBackendFormat(shortcut: CapturedShortcut): {
  modifier: string;
  key: string;
} {
  const modMap: Record<string, string> = {
    Meta: "super",
    Control: "ctrl",
    Alt: "alt",
    Shift: "shift",
  };

  const order = ["super", "ctrl", "alt", "shift"];
  const mods = shortcut.modifiers.map((m) => modMap[m] || m.toLowerCase());
  const sorted = mods.sort((a, b) => order.indexOf(a) - order.indexOf(b));

  return {
    modifier: sorted.join("+"),
    key: shortcut.key.toLowerCase(),
  };
}

export function formatModifierDisplay(
  modifier: string,
  platform: string
): string {
  switch (modifier) {
    case "Meta":
      return platform === "macos" ? "Cmd" : platform === "windows" ? "Win" : "Super";
    case "Control":
      return "Ctrl";
    case "Alt":
      return "Alt";
    case "Shift":
      return "Shift";
    default:
      return modifier;
  }
}
