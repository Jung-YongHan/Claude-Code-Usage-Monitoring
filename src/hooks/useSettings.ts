import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { AppSettings, LayoutType } from "../services/types";

interface PlatformInfo {
  name: string;
  shortcut_display: string;
  transparency_supported: boolean;
  is_first_launch: boolean;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      invoke<AppSettings>("get_settings"),
      invoke<PlatformInfo>("get_platform_info"),
    ])
      .then(([s, p]) => {
        setSettings(s);
        setPlatformInfo(p);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        setIsLoading(false);
      });
  }, []);

  const saveShortcut = async (modifier: string, key: string) => {
    try {
      await invoke("save_shortcut_setting", { modifier, key });
      setSettings((prev) =>
        prev ? { ...prev, shortcut: { modifier, key } } : null
      );
    } catch (err) {
      console.error("Failed to save shortcut:", err);
      throw err;
    }
  };

  const completeFirstLaunch = async () => {
    await invoke("complete_first_launch");
    setPlatformInfo((prev) =>
      prev ? { ...prev, is_first_launch: false } : null
    );
  };

  const saveLayout = async (layoutType: LayoutType) => {
    try {
      await invoke("save_layout_setting", { layoutType });
      setSettings((prev) =>
        prev ? { ...prev, layout: { layout_type: layoutType } } : null
      );
    } catch (err) {
      console.error("Failed to save layout:", err);
      throw err;
    }
  };

  const centerWindow = async () => {
    await invoke("center_settings_window");
  };

  return {
    settings,
    platformInfo,
    isLoading,
    saveShortcut,
    saveLayout,
    completeFirstLaunch,
    centerWindow,
  };
}
