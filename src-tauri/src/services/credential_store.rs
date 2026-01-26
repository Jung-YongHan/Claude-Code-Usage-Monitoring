use std::path::PathBuf;
use thiserror::Error;

use crate::models::{ClaudeOAuth, CredentialsFile};

#[derive(Error, Debug)]
pub enum CredentialError {
    #[error("Credentials file not found")]
    NotFound,

    #[error("Failed to read credentials file: {0}")]
    ReadError(#[from] std::io::Error),

    #[error("Failed to parse credentials: {0}")]
    ParseError(#[from] serde_json::Error),

    #[error("No OAuth credentials found in file")]
    NoOAuthCredentials,
}

pub fn get_credentials_path() -> PathBuf {
    let home = dirs::home_dir().expect("Could not find home directory");
    home.join(".claude").join(".credentials.json")
}

pub fn read_credentials() -> Result<ClaudeOAuth, CredentialError> {
    let path = get_credentials_path();

    if !path.exists() {
        return Err(CredentialError::NotFound);
    }

    let content = std::fs::read_to_string(&path)?;
    let creds: CredentialsFile = serde_json::from_str(&content)?;

    creds
        .claude_ai_oauth
        .ok_or(CredentialError::NoOAuthCredentials)
}

pub fn is_token_valid(creds: &ClaudeOAuth) -> bool {
    let now = chrono::Utc::now().timestamp_millis();
    creds.expires_at > now
}
