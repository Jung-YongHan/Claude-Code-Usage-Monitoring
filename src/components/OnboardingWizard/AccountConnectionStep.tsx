import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle, AlertCircle, RefreshCw, User, ExternalLink } from "lucide-react";
import { AuthStatus } from "../../services/types";
import { launchClaudeCli } from "../../services/tauri-commands";

type ConnectionState = "idle" | "launching" | "polling";

interface AccountConnectionStepProps {
  authStatus: AuthStatus | undefined;
  isLoading: boolean;
  onRetry: () => void;
  onSkip: () => void;
  onContinue: () => void;
}

export function AccountConnectionStep({
  authStatus,
  isLoading,
  onRetry,
  onSkip,
  onContinue,
}: AccountConnectionStepProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const onRetryRef = useRef(onRetry);
  onRetryRef.current = onRetry;

  const isConnected = authStatus?.authenticated ?? false;
  const expiresAt = authStatus?.expires_at;

  // Auto-continue when connected during polling
  useEffect(() => {
    if (isConnected && connectionState === "polling") {
      setConnectionState("idle");
    }
  }, [isConnected, connectionState]);

  // Polling effect
  useEffect(() => {
    if (connectionState !== "polling") return;

    const interval = setInterval(() => {
      onRetryRef.current();
    }, 2000);

    return () => clearInterval(interval);
  }, [connectionState]);

  const handleConnect = useCallback(async () => {
    setError(null);
    setConnectionState("launching");

    try {
      await launchClaudeCli();
      setConnectionState("polling");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Claude CLI 실행 실패");
      setConnectionState("idle");
    }
  }, []);

  const handleCancelPolling = useCallback(() => {
    setConnectionState("idle");
  }, []);

  const formatExpiration = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}시간 ${minutes}분 후`;
    }
    return `${minutes}분 후`;
  };

  const isPolling = connectionState === "polling";
  const isLaunching = connectionState === "launching";

  return (
    <div className="p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-200">계정 연결</h2>
          <p className="text-xs text-slate-400">
            Claude 계정을 연결하여 사용량을 확인합니다
          </p>
        </div>
      </div>

      {/* Status Card */}
      <div
        className={`p-4 rounded-lg border-2 mb-4 ${
          isConnected
            ? "bg-green-500/10 border-green-500/30"
            : isPolling
              ? "bg-blue-500/10 border-blue-500/30"
              : "bg-amber-500/10 border-amber-500/30"
        }`}
      >
        {isLoading && !isPolling ? (
          <div className="flex items-center gap-2 text-slate-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">확인 중...</span>
          </div>
        ) : isConnected ? (
          <>
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">연결됨</span>
            </div>
            {expiresAt && (
              <p className="text-xs text-slate-400 ml-7">
                토큰 만료: {formatExpiration(expiresAt)}
              </p>
            )}
          </>
        ) : isPolling ? (
          <>
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">연결 대기 중...</span>
            </div>
            <p className="text-xs text-slate-400 ml-7">
              브라우저에서 로그인을 완료하면 자동으로 연결됩니다
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">연결 필요</span>
            </div>
            <p className="text-xs text-slate-400 ml-7">
              Claude 계정에 로그인하여 API 사용량을 확인할 수 있습니다
            </p>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto space-y-2">
        {isConnected ? (
          <button
            onClick={onContinue}
            className="w-full px-4 py-3 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
          >
            다음 단계로
          </button>
        ) : isPolling ? (
          <button
            onClick={handleCancelPolling}
            className="w-full px-4 py-3 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
          >
            취소
          </button>
        ) : (
          <>
            <button
              onClick={handleConnect}
              disabled={isLaunching}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-lg transition-colors font-medium"
            >
              {isLaunching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  실행 중...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  연결하기
                </>
              )}
            </button>
            <button
              onClick={onSkip}
              className="w-full px-4 py-3 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
            >
              나중에 연결
            </button>
          </>
        )}
      </div>
    </div>
  );
}
