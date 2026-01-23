import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatResetTime(isoString: string | null): string {
  if (!isoString) return "--";

  try {
    const date = parseISO(isoString);
    const now = new Date();

    // If reset is within 24 hours, show relative time
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24 && diffHours > 0) {
      return formatDistanceToNow(date, { addSuffix: true });
    }

    // Otherwise show date
    return format(date, "MMM d, h:mm a");
  } catch {
    return "--";
  }
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatLastUpdated(date: Date): string {
  return format(date, "h:mm:ss a");
}
