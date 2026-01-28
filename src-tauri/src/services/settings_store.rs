use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum LayoutType {
    Simple,
    Detailed,
}

impl Default for LayoutType {
    fn default() -> Self {
        Self::Simple
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LayoutConfig {
    pub layout_type: LayoutType,
}

impl Default for LayoutConfig {
    fn default() -> Self {
        Self {
            layout_type: LayoutType::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub shortcut: ShortcutConfig,
    pub first_launch: bool,
    #[serde(default)]
    pub layout: LayoutConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShortcutConfig {
    pub modifier: String,
    pub key: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            shortcut: ShortcutConfig::default(),
            first_launch: true,
            layout: LayoutConfig::default(),
        }
    }
}

impl Default for ShortcutConfig {
    fn default() -> Self {
        #[cfg(target_os = "macos")]
        {
            Self {
                modifier: "super+shift".to_string(),
                key: "u".to_string(),
            }
        }

        #[cfg(target_os = "linux")]
        {
            Self {
                modifier: "ctrl+shift".to_string(),
                key: "u".to_string(),
            }
        }

        #[cfg(target_os = "windows")]
        {
            Self {
                modifier: "alt".to_string(),
                key: "r".to_string(),
            }
        }

        #[cfg(not(any(target_os = "macos", target_os = "linux", target_os = "windows")))]
        {
            Self {
                modifier: "ctrl+shift".to_string(),
                key: "u".to_string(),
            }
        }
    }
}

pub fn get_settings_path() -> PathBuf {
    let home = dirs::home_dir().expect("Could not find home directory");
    home.join(".claude-usage-monitor").join("settings.json")
}

pub fn load_settings() -> AppSettings {
    let path = get_settings_path();
    if path.exists() {
        std::fs::read_to_string(&path)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_default()
    } else {
        AppSettings::default()
    }
}

pub fn save_settings(settings: &AppSettings) -> Result<(), std::io::Error> {
    let path = get_settings_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let json = serde_json::to_string_pretty(settings)?;
    std::fs::write(path, json)
}

/// 설정 파일을 삭제하여 최초 실행 상태로 리셋
#[allow(dead_code)]
pub fn reset_settings() {
    let path = get_settings_path();
    if path.exists() {
        let _ = std::fs::remove_file(&path);
    }
}
