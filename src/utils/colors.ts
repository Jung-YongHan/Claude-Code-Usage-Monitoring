export function getUsageColor(utilization: number): string {
  if (utilization >= 90) return "#ef4444"; // Red
  if (utilization >= 75) return "#f97316"; // Orange
  if (utilization >= 50) return "#f59e0b"; // Yellow
  return "#10b981"; // Green
}

export function getUsageColorClass(utilization: number): string {
  if (utilization >= 90) return "bg-red-500";
  if (utilization >= 75) return "bg-orange-500";
  if (utilization >= 50) return "bg-yellow-500";
  return "bg-emerald-500";
}

export function getUsageTextColorClass(utilization: number): string {
  if (utilization >= 90) return "text-red-400";
  if (utilization >= 75) return "text-orange-400";
  if (utilization >= 50) return "text-yellow-400";
  return "text-emerald-400";
}
