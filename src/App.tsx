import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useAuth } from "./hooks/useAuth";
import { Overlay } from "./components/Overlay/Overlay";

function App() {
  const [isVisible, setIsVisible] = useState(true);
  const { data: authStatus, isLoading } = useAuth();

  useEffect(() => {
    const unlisten = listen<boolean>("overlay-visibility", (event) => {
      setIsVisible(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // Overlay style - minimal HUD
  return (
    <div className="bg-black/90 rounded-md">
      {isLoading ? (
        <div className="p-2 text-[10px] text-slate-400 font-mono">...</div>
      ) : authStatus?.authenticated ? (
        <Overlay enabled={isVisible} />
      ) : (
        <div className="p-2 text-[10px] text-red-400 font-mono">
          Login required
        </div>
      )}
    </div>
  );
}

export default App;
