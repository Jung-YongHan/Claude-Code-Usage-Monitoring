export interface UsageMetric {
  utilization: number;
  resets_at: string | null;
}

export interface UsageData {
  five_hour: UsageMetric;
  seven_day: UsageMetric;
  seven_day_opus: UsageMetric | null;
  seven_day_sonnet: UsageMetric | null;
}

export interface AuthStatus {
  authenticated: boolean;
  expires_at: number | null;
  credentials_path: string;
  error_reason: string | null;
}

export interface ApiError {
  code: string;
  message: string;
}

export type LayoutType = "simple" | "detailed";

export interface LayoutConfig {
  layout_type: LayoutType;
}

export interface ShortcutConfig {
  modifier: string;
  key: string;
}

export interface AppSettings {
  shortcut: ShortcutConfig;
  first_launch: boolean;
  layout: LayoutConfig;
}
