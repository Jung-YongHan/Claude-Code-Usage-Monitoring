interface LoginRequiredProps {
  errorReason: string | null;
  credentialsPath: string;
}

export function LoginRequired({
  errorReason,
  credentialsPath,
}: LoginRequiredProps) {
  const getErrorMessage = () => {
    switch (errorReason) {
      case "not_found":
        return "Credentials file not found";
      case "no_oauth":
        return "No OAuth credentials";
      case "token_expired":
        return "Token expired";
      case "read_error":
        return "Cannot read credentials";
      case "parse_error":
        return "Invalid credentials format";
      default:
        return "Login required";
    }
  };

  const getInstructions = () => {
    switch (errorReason) {
      case "not_found":
      case "no_oauth":
        return (
          <>
            <p className="mb-2">Run in terminal:</p>
            <code className="block bg-black/50 px-2 py-1 rounded text-green-400 mb-2">
              claude
            </code>
            <p className="text-slate-500">Then complete the login flow.</p>
          </>
        );
      case "token_expired":
        return (
          <>
            <p className="mb-2">Your session has expired.</p>
            <p className="mb-1">Run in terminal:</p>
            <code className="block bg-black/50 px-2 py-1 rounded text-green-400 mb-2">
              claude
            </code>
          </>
        );
      case "read_error":
        return (
          <>
            <p className="mb-2">Cannot access credentials file:</p>
            <code className="block bg-black/50 px-1 py-1 rounded text-yellow-400 text-[8px] break-all mb-2">
              {credentialsPath}
            </code>
            <p className="text-slate-500">Check file permissions.</p>
          </>
        );
      default:
        return (
          <>
            <p className="mb-2">Please login first:</p>
            <code className="block bg-black/50 px-2 py-1 rounded text-green-400">
              claude
            </code>
          </>
        );
    }
  };

  return (
    <div className="p-3 text-[10px] text-slate-300 font-mono">
      <div className="text-red-400 font-semibold mb-2">{getErrorMessage()}</div>
      <div className="text-slate-400">{getInstructions()}</div>
    </div>
  );
}
