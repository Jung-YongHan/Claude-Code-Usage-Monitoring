import { RefreshCw, Key, Terminal } from "lucide-react";

interface LoginScreenProps {
  onCheckAgain: () => void;
  isChecking: boolean;
  credentialsPath: string;
}

export function LoginScreen({
  onCheckAgain,
  isChecking,
  credentialsPath,
}: LoginScreenProps) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[350px]">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
        <Key className="w-8 h-8 text-amber-500" />
      </div>

      <h2 className="text-lg font-semibold text-slate-200 mb-2">
        Login Required
      </h2>

      <p className="text-sm text-slate-400 text-center mb-6 max-w-[250px]">
        To use this app, you need to be logged into Claude Code.
      </p>

      <div className="w-full bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300">
            1
          </div>
          <p className="text-sm text-slate-300">Open a terminal</p>
        </div>

        <div className="flex items-start gap-3 mb-3">
          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300">
            2
          </div>
          <div>
            <p className="text-sm text-slate-300 mb-1">Run:</p>
            <code className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg text-sm text-emerald-400 font-mono">
              <Terminal className="w-4 h-4 text-slate-500" />
              claude
            </code>
          </div>
        </div>

        <div className="flex items-start gap-3 mb-3">
          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300">
            3
          </div>
          <p className="text-sm text-slate-300">Complete the login</p>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300">
            4
          </div>
          <p className="text-sm text-slate-300">Return here and click Refresh</p>
        </div>
      </div>

      <button
        onClick={onCheckAgain}
        disabled={isChecking}
        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
        Check Again
      </button>

      <div className="mt-6 text-xs text-slate-600 text-center">
        <p>Checking: {credentialsPath}</p>
      </div>
    </div>
  );
}
