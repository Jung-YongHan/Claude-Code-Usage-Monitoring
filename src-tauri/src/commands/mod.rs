use std::process::Command;

use crate::models::{AuthStatus, UsageResponse};
use crate::platform;
use crate::services::settings_store::{self, AppSettings, LayoutConfig, LayoutType, ShortcutConfig};
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
                crate::services::CredentialError::KeychainError(_) => "keychain_error",
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
pub fn save_layout_setting(layout_type: String) -> Result<(), String> {
    let mut settings = settings_store::load_settings();
    settings.layout = LayoutConfig {
        layout_type: match layout_type.as_str() {
            "detailed" => LayoutType::Detailed,
            _ => LayoutType::Simple,
        },
    };
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
pub fn set_window_size(window: tauri::Window, width: u32, height: u32) -> Result<(), String> {
    window
        .set_size(tauri::LogicalSize::new(width, height))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn launch_claude_cli() -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        // On macOS, open Terminal with a specific title for later identification
        let script = r#"tell application "Terminal"
            activate
            set newTab to do script "claude"
            set custom title of newTab to "Claude Login"
        end tell"#;

        Command::new("osascript")
            .arg("-e")
            .arg(script)
            .spawn()
            .map_err(|e| format!("Failed to open Terminal: {}", e))?;

        return Ok(());
    }

    #[cfg(target_os = "windows")]
    {
        // On Windows, open cmd with a specific title
        Command::new("cmd")
            .args(["/c", "start", "Claude Login", "cmd", "/k", "claude"])
            .spawn()
            .map_err(|e| format!("Failed to open Command Prompt: {}", e))?;

        return Ok(());
    }

    #[cfg(target_os = "linux")]
    {
        // On Linux, try common terminal emulators with title
        let terminals = [
            ("gnome-terminal", vec!["--title=Claude Login", "--", "claude"]),
            ("konsole", vec!["--title", "Claude Login", "-e", "claude"]),
            ("xfce4-terminal", vec!["--title=Claude Login", "-e", "claude"]),
            ("xterm", vec!["-title", "Claude Login", "-e", "claude"]),
        ];

        for (term, args) in terminals {
            if Command::new(term).args(&args).spawn().is_ok() {
                return Ok(());
            }
        }

        return Err("No supported terminal emulator found".to_string());
    }

    #[allow(unreachable_code)]
    Err("Unsupported platform".to_string())
}

#[tauri::command]
pub fn close_claude_terminal() -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        // Close Terminal windows with "Claude Login" in the title
        let script = r#"tell application "Terminal"
            set windowsToClose to every window whose name contains "Claude Login"
            repeat with w in windowsToClose
                close w
            end repeat
        end tell"#;

        Command::new("osascript")
            .arg("-e")
            .arg(script)
            .output()
            .map_err(|e| format!("Failed to close Terminal: {}", e))?;

        return Ok(());
    }

    #[cfg(target_os = "windows")]
    {
        // On Windows, close the window by title
        Command::new("taskkill")
            .args(["/FI", "WINDOWTITLE eq Claude Login", "/T", "/F"])
            .output()
            .ok();

        return Ok(());
    }

    #[cfg(target_os = "linux")]
    {
        // On Linux, use wmctrl if available
        Command::new("wmctrl")
            .args(["-c", "Claude Login"])
            .output()
            .ok();

        return Ok(());
    }

    #[allow(unreachable_code)]
    Ok(())
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
