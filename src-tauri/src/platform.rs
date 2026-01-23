use crate::services::settings_store::ShortcutConfig;
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut};

pub fn parse_shortcut(config: &ShortcutConfig) -> Option<Shortcut> {
    let modifier = match config.modifier.to_lowercase().as_str() {
        "alt" => Some(Modifiers::ALT),
        "ctrl" | "control" => Some(Modifiers::CONTROL),
        "super" | "cmd" | "meta" => Some(Modifiers::SUPER),
        "shift" => Some(Modifiers::SHIFT),
        "ctrl+shift" | "control+shift" => Some(Modifiers::CONTROL | Modifiers::SHIFT),
        "super+shift" | "cmd+shift" => Some(Modifiers::SUPER | Modifiers::SHIFT),
        "alt+shift" => Some(Modifiers::ALT | Modifiers::SHIFT),
        _ => None,
    };

    let key = match config.key.to_lowercase().as_str() {
        "a" => Some(Code::KeyA),
        "b" => Some(Code::KeyB),
        "c" => Some(Code::KeyC),
        "d" => Some(Code::KeyD),
        "e" => Some(Code::KeyE),
        "f" => Some(Code::KeyF),
        "g" => Some(Code::KeyG),
        "h" => Some(Code::KeyH),
        "i" => Some(Code::KeyI),
        "j" => Some(Code::KeyJ),
        "k" => Some(Code::KeyK),
        "l" => Some(Code::KeyL),
        "m" => Some(Code::KeyM),
        "n" => Some(Code::KeyN),
        "o" => Some(Code::KeyO),
        "p" => Some(Code::KeyP),
        "q" => Some(Code::KeyQ),
        "r" => Some(Code::KeyR),
        "s" => Some(Code::KeyS),
        "t" => Some(Code::KeyT),
        "u" => Some(Code::KeyU),
        "v" => Some(Code::KeyV),
        "w" => Some(Code::KeyW),
        "x" => Some(Code::KeyX),
        "y" => Some(Code::KeyY),
        "z" => Some(Code::KeyZ),
        _ => None,
    };

    match (modifier, key) {
        (Some(m), Some(k)) => Some(Shortcut::new(Some(m), k)),
        _ => None,
    }
}

pub fn get_platform_name() -> &'static str {
    #[cfg(target_os = "macos")]
    {
        "macos"
    }
    #[cfg(target_os = "linux")]
    {
        "linux"
    }
    #[cfg(target_os = "windows")]
    {
        "windows"
    }
    #[cfg(not(any(target_os = "macos", target_os = "linux", target_os = "windows")))]
    {
        "unknown"
    }
}

pub fn check_transparency_support() -> bool {
    #[cfg(target_os = "linux")]
    {
        std::env::var("WAYLAND_DISPLAY").is_ok()
            || std::env::var("XDG_SESSION_TYPE")
                .map(|v| v == "wayland")
                .unwrap_or(false)
            || true
    }
    #[cfg(not(target_os = "linux"))]
    {
        true
    }
}
