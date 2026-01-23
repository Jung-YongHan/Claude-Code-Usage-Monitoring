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
}

export interface ApiError {
  code: string;
  message: string;
}
