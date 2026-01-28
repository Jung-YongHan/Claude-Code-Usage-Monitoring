import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { useAuth } from "./hooks/useAuth";
import { useSettings } from "./hooks/useSettings";
import { Overlay } from "./components/Overlay/Overlay";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { OnboardingWizard } from "./components/OnboardingWizard";
import { LoginRequired } from "./components/LoginRequired";

function App() {
  const [isVisible, setIsVisible] = useState(true);
  const { data: authStatus, isLoading: authLoading } = useAuth();
  const {
    settings,
    platformInfo,
    isLoading: settingsLoading,
    saveShortcut,
    saveLayout,
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

  // Adjust window size based on app state and layout
  useEffect(() => {
    const adjustWindowSize = async () => {
      const window = getCurrentWindow();
      console.log("adjustWindowSize called, is_first_launch:", platformInfo?.is_first_launch);
      if (platformInfo?.is_first_launch) {
        // Size is managed by OnboardingWizard component
        await centerWindow();
      } else if (!authLoading && authStatus && !authStatus.authenticated) {
        await window.setSize(new LogicalSize(200, 140));
      } else {
        // Set size based on layout type
        const layoutType = settings?.layout?.layout_type ?? "simple";
        if (layoutType === "detailed") {
          await window.setSize(new LogicalSize(380, 360));
        } else {
          await window.setSize(new LogicalSize(140, 75));
        }
      }
    };

    if (platformInfo !== null && settings !== null) {
      adjustWindowSize();
    }
  }, [platformInfo, settings, centerWindow, authLoading, authStatus]);

  const isLoading = authLoading || settingsLoading;

  // Transparency fallback for Linux without compositor
  const bgClass =
    platformInfo?.transparency_supported === false
      ? "bg-slate-900 border border-slate-700"
      : "bg-black/90";

  // First launch - show onboarding wizard
  if (platformInfo?.is_first_launch) {
    return (
      <div className="bg-slate-900 h-full pt-8">
        <OnboardingWizard
          platformName={platformInfo.name}
          onComplete={async (modifier, key, layoutType) => {
            await saveLayout(layoutType);
            await saveShortcut(modifier, key);
            await completeFirstLaunch();
          }}
          centerWindow={centerWindow}
        />
      </div>
    );
  }

  // Normal overlay view
  const layoutType = settings?.layout?.layout_type ?? "simple";

  const renderContent = () => {
    if (isLoading) {
      return <div className="p-2 text-[10px] text-slate-400 font-mono">...</div>;
    }

    if (!authStatus?.authenticated) {
      return (
        <LoginRequired
          errorReason={authStatus?.error_reason ?? null}
          credentialsPath={authStatus?.credentials_path ?? ""}
        />
      );
    }

    if (layoutType === "detailed") {
      return <Dashboard />;
    }

    return <Overlay enabled={isVisible} />;
  };

  return (
    <div className={`${bgClass} rounded-md overflow-hidden`}>
      {renderContent()}
    </div>
  );
}

export default App;
