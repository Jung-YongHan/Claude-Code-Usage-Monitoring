use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct CredentialsFile {
    #[serde(rename = "claudeAiOauth")]
    pub claude_ai_oauth: Option<ClaudeOAuth>,
}

#[derive(Debug, Deserialize)]
pub struct ClaudeOAuth {
    #[serde(rename = "accessToken")]
    pub access_token: String,

    #[serde(rename = "refreshToken")]
    pub refresh_token: Option<String>,

    #[serde(rename = "expiresAt")]
    pub expires_at: i64,

    pub scopes: Option<Vec<String>>,
}

#[derive(Debug, Serialize)]
pub struct AuthStatus {
    pub authenticated: bool,
    pub expires_at: Option<i64>,
    pub credentials_path: String,
    pub error_reason: Option<String>,
}
