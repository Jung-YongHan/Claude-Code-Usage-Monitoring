use std::process::Command;

use crate::models::{AuthStatus, UsageResponse};
use crate::platform;
use crate::services::settings_store::{self, AppSettings, ShortcutConfig};
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
                error_reason: if is_valid {
                    None
                } else {
                    Some("token_expired".to_string())
                },
            })
        }
        Err(e) => {
            let error_reason = match e {
                crate::services::CredentialError::NotFound => "not_found",
                crate::services::CredentialError::NoOAuthCredentials => "no_oauth",
                crate::services::CredentialError::ReadError(_) => "read_error",
                crate::services::CredentialError::ParseError(_) => "parse_error",
            };
            Ok(AuthStatus {
                authenticated: false,
                expires_at: None,
                credentials_path: path_str,
                error_reason: Some(error_reason.to_string()),
            })
        }
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

#[tauri::command]
pub fn get_settings() -> AppSettings {
    settings_store::load_settings()
}

#[tauri::command]
pub fn save_shortcut_setting(modifier: String, key: String) -> Result<(), String> {
    let mut settings = settings_store::load_settings();
    settings.shortcut = ShortcutConfig { modifier, key };
    settings.first_launch = false;
    settings_store::save_settings(&settings).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn complete_first_launch() -> Result<(), String> {
    let mut settings = settings_store::load_settings();
    settings.first_launch = false;
    settings_store::save_settings(&settings).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_platform_info() -> PlatformInfo {
    let settings = settings_store::load_settings();
    PlatformInfo {
        name: platform::get_platform_name().to_string(),
        shortcut_display: format_shortcut_display(&settings.shortcut),
        transparency_supported: platform::check_transparency_support(),
        is_first_launch: settings.first_launch,
    }
}

#[derive(serde::Serialize)]
pub struct PlatformInfo {
    pub name: String,
    pub shortcut_display: String,
    pub transparency_supported: bool,
    pub is_first_launch: bool,
}

#[tauri::command]
pub fn center_settings_window(window: tauri::Window) -> Result<(), String> {
    if let Ok(Some(monitor)) = window.current_monitor() {
        let monitor_size = monitor.size();
        let window_size = window.outer_size().map_err(|e| e.to_string())?;

        let x = (monitor_size.width - window_size.width) / 2;
        let y = (monitor_size.height - window_size.height) / 2;

        window
            .set_position(tauri::PhysicalPosition::new(x as i32, y as i32))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn launch_claude_cli() -> Result<(), String> {
    // Try to find claude in common locations
    let claude_paths = if cfg!(target_os = "windows") {
        vec!["claude.exe", "claude"]
    } else {
        vec![
            "claude",
            "/usr/local/bin/claude",
            "/opt/homebrew/bin/claude",
        ]
    };

    for path in claude_paths {
        let result = Command::new(path).spawn();

        if result.is_ok() {
            return Ok(());
        }
    }

    Err("Claude CLI not found. Please install Claude Code first.".to_string())
}

fn format_shortcut_display(config: &ShortcutConfig) -> String {
    let modifier_display = match config.modifier.to_lowercase().as_str() {
        "super" | "cmd" | "meta" => "Cmd",
        "ctrl" | "control" => "Ctrl",
        "alt" => "Alt",
        "shift" => "Shift",
        "ctrl+shift" | "control+shift" => "Ctrl+Shift",
        "super+shift" | "cmd+shift" => "Cmd+Shift",
        "alt+shift" => "Alt+Shift",
        _ => &config.modifier,
    };
    format!("{}+{}", modifier_display, config.key.to_uppercase())
}
