use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour: UsageMetric,
    pub seven_day: UsageMetric,
    pub seven_day_opus: Option<UsageMetric>,
    pub seven_day_sonnet: Option<UsageMetric>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UsageMetric {
    pub utilization: f64,
    pub resets_at: Option<String>,
}
