use crate::models::{AuthStatus, UsageResponse};
use crate::services::{fetch_usage, get_credentials_path, is_token_valid, read_credentials};

#[tauri::command]
pub async fn check_credentials() -> Result<AuthStatus, String> {
    let path = get_credentials_path();
    let path_str = path.display().to_string();

    match read_credentials() {
        Ok(creds) => {
            let is_valid = is_token_valid(&creds);
            Ok(AuthStatus {
                authenticated: is_valid,
                expires_at: Some(creds.expires_at),
                credentials_path: path_str,
            })
        }
        Err(_) => Ok(AuthStatus {
            authenticated: false,
            expires_at: None,
            credentials_path: path_str,
        }),
    }
}

#[tauri::command]
pub async fn fetch_usage_data() -> Result<UsageResponse, String> {
    let creds = read_credentials().map_err(|e| e.to_string())?;

    if !is_token_valid(&creds) {
        return Err("Token has expired. Please login again using 'claude' CLI.".to_string());
    }

    let usage = fetch_usage(&creds.access_token)
        .await
        .map_err(|e| e.to_string())?;

    Ok(usage)
}

#[tauri::command]
pub fn get_credentials_path_cmd() -> String {
    get_credentials_path().display().to_string()
}
