import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { useAuth } from "./hooks/useAuth";
import { useSettings } from "./hooks/useSettings";
import { Overlay } from "./components/Overlay/Overlay";
import { ShortcutSettings } from "./components/ShortcutSettings/ShortcutSettings";
import { LoginRequired } from "./components/LoginRequired";

function App() {
  const [isVisible, setIsVisible] = useState(true);
  const { data: authStatus, isLoading: authLoading } = useAuth();
  const {
    platformInfo,
    isLoading: settingsLoading,
    saveShortcut,
    completeFirstLaunch,
    centerWindow,
  } = useSettings();

  useEffect(() => {
    const unlisten = listen<boolean>("overlay-visibility", (event) => {
      setIsVisible(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // Adjust window size based on app state
  useEffect(() => {
    const adjustWindowSize = async () => {
      const window = getCurrentWindow();
      console.log("adjustWindowSize called, is_first_launch:", platformInfo?.is_first_launch);
      if (platformInfo?.is_first_launch) {
        // Size is managed by ShortcutSettings component
        await centerWindow();
      } else if (!authLoading && authStatus && !authStatus.authenticated) {
        await window.setSize(new LogicalSize(200, 140));
      } else {
        await window.setSize(new LogicalSize(140, 75));
      }
    };

    if (platformInfo !== null) {
      adjustWindowSize();
    }
  }, [platformInfo?.is_first_launch, centerWindow, authLoading, authStatus]);

  const isLoading = authLoading || settingsLoading;

  // Transparency fallback for Linux without compositor
  const bgClass =
    platformInfo?.transparency_supported === false
      ? "bg-slate-900 border border-slate-700"
      : "bg-black/90";

  // First launch - show shortcut settings
  if (platformInfo?.is_first_launch) {
    return (
      <div className="bg-slate-900 h-full pt-8">
        <ShortcutSettings
          platformName={platformInfo.name}
          onNext={async (modifier, key) => {
            await saveShortcut(modifier, key);
            await completeFirstLaunch();
          }}
        />
      </div>
    );
  }

  // Normal overlay view
  return (
    <div className={`${bgClass} rounded-md overflow-hidden`}>
      {isLoading ? (
        <div className="p-2 text-[10px] text-slate-400 font-mono">...</div>
      ) : authStatus?.authenticated ? (
        <Overlay enabled={isVisible} />
      ) : (
        <LoginRequired
          errorReason={authStatus?.error_reason ?? null}
          credentialsPath={authStatus?.credentials_path ?? ""}
        />
      )}
    </div>
  );
}

export default App;
