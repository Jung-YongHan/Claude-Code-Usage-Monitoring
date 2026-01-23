import { useUsageData } from "../../hooks/useUsageData";
import { getUsageColor } from "../../utils/colors";

interface OverlayProps {
  enabled?: boolean;
}

export function Overlay({ enabled = true }: OverlayProps) {
  const { data, isLoading, error } = useUsageData(enabled);

  if (isLoading) {
    return (
      <div className="p-2 font-mono text-xs text-slate-400">
        Loading...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-2 font-mono text-xs text-red-400">
        Error
      </div>
    );
  }

  const items = [
    { label: "5H", value: data.five_hour.utilization },
    { label: "7D", value: data.seven_day.utilization },
    ...(data.seven_day_sonnet ? [{ label: "SNT", value: data.seven_day_sonnet.utilization }] : []),
  ];

  return (
    <div
      data-tauri-drag-region
      className="p-2 select-none cursor-move"
    >
      <div className="space-y-0.5 font-mono text-[11px] font-bold tracking-tight">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-slate-400 w-6">{item.label}</span>
            <span style={{ color: getUsageColor(item.value) }}>
              {item.value.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
