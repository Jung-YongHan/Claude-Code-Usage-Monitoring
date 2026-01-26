use thiserror::Error;

use crate::models::UsageResponse;

const USAGE_ENDPOINT: &str = "https://api.anthropic.com/api/oauth/usage";
const USER_AGENT: &str = "claude-code-usage-monitor/1.0.0";
const ANTHROPIC_BETA: &str = "oauth-2025-04-20";

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),

    #[error("API returned error: {status} - {message}")]
    Response { status: u16, message: String },
}

pub async fn fetch_usage(access_token: &str) -> Result<UsageResponse, ApiError> {
    let client = reqwest::Client::new();

    let response = client
        .get(USAGE_ENDPOINT)
        .header("Authorization", format!("Bearer {}", access_token))
        .header("User-Agent", USER_AGENT)
        .header("anthropic-beta", ANTHROPIC_BETA)
        .send()
        .await?;

    let status = response.status();

    if !status.is_success() {
        let message = response.text().await.unwrap_or_default();
        return Err(ApiError::Response {
            status: status.as_u16(),
            message,
        });
    }

    let usage: UsageResponse = response.json().await?;
    Ok(usage)
}
