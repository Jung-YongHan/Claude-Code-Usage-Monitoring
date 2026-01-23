import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { useUsageData } from "../../hooks/useUsageData";
import { UsageCard } from "../UsageCard/UsageCard";
import { formatLastUpdated } from "../../utils/formatters";

export function Dashboard() {
  const { data, isLoading, error, refetch, isFetching } = useUsageData();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (data && !isFetching) {
      setLastUpdated(new Date());
    }
  }, [data, isFetching]);

  if (isLoading) {
    return (
      <div className="p-3 space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50 animate-pulse"
          >
            <div className="h-3 bg-slate-700 rounded w-20 mb-2" />
            <div className="h-1.5 bg-slate-700 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3">
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3 text-center">
          <p className="text-red-400 text-xs mb-2">Failed to load</p>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-3 space-y-2">
      <UsageCard title="5-Hour" metric={data.five_hour} />
      <UsageCard title="7-Day" metric={data.seven_day} />
      {data.seven_day_sonnet && (
        <UsageCard title="Sonnet" metric={data.seven_day_sonnet} />
      )}
      {data.seven_day_opus && (
        <UsageCard title="Opus" metric={data.seven_day_opus} />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          {isFetching && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
          {formatLastUpdated(lastUpdated)}
        </span>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
