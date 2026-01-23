import type { UsageMetric } from "../../services/types";
import { formatResetTime, formatPercentage } from "../../utils/formatters";
import { getUsageColorClass, getUsageTextColorClass } from "../../utils/colors";

interface UsageCardProps {
  title: string;
  metric: UsageMetric;
}

export function UsageCard({ title, metric }: UsageCardProps) {
  const colorClass = getUsageColorClass(metric.utilization);
  const textColorClass = getUsageTextColorClass(metric.utilization);

  return (
    <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50">
      <div className="flex justify-between items-center mb-1.5">
        <h3 className="text-xs font-medium text-slate-300">{title}</h3>
        <span className={`text-sm font-bold ${textColorClass}`}>
          {formatPercentage(metric.utilization)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-1">
        <div
          className={`h-full ${colorClass} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(metric.utilization, 100)}%` }}
        />
      </div>

      {/* Reset time */}
      <div className="text-[10px] text-slate-500 text-right">
        {formatResetTime(metric.resets_at)}
      </div>
    </div>
  );
}
