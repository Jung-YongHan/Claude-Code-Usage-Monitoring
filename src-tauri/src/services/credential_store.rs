use std::path::PathBuf;
use std::process::Command;
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

    #[error("Failed to read from keychain: {0}")]
    KeychainError(String),
}

pub fn get_credentials_path() -> PathBuf {
    let home = dirs::home_dir().expect("Could not find home directory");
    home.join(".claude").join(".credentials.json")
}

/// Read credentials from macOS Keychain
#[cfg(target_os = "macos")]
fn read_from_keychain() -> Result<ClaudeOAuth, CredentialError> {
    let output = Command::new("security")
        .args(["find-generic-password", "-s", "Claude Code-credentials", "-w"])
        .output()
        .map_err(|e| CredentialError::KeychainError(e.to_string()))?;

    if !output.status.success() {
        return Err(CredentialError::NotFound);
    }

    let content = String::from_utf8_lossy(&output.stdout);
    let creds: CredentialsFile = serde_json::from_str(content.trim())?;

    creds
        .claude_ai_oauth
        .ok_or(CredentialError::NoOAuthCredentials)
}

pub fn read_credentials() -> Result<ClaudeOAuth, CredentialError> {
    // First try reading from file (works on Linux/Windows)
    let path = get_credentials_path();

    if path.exists() {
        let content = std::fs::read_to_string(&path)?;
        let creds: CredentialsFile = serde_json::from_str(&content)?;
        if let Some(oauth) = creds.claude_ai_oauth {
            return Ok(oauth);
        }
    }

    // On macOS, try reading from Keychain
    #[cfg(target_os = "macos")]
    {
        return read_from_keychain();
    }

    #[cfg(not(target_os = "macos"))]
    Err(CredentialError::NotFound)
}

pub fn is_token_valid(creds: &ClaudeOAuth) -> bool {
    let now = chrono::Utc::now().timestamp_millis();
    creds.expires_at > now
}
