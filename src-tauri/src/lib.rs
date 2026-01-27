mod commands;
mod models;
mod platform;
mod services;

use commands::{
    center_settings_window, check_credentials, complete_first_launch, fetch_usage_data,
    get_credentials_path_cmd, get_platform_info, get_settings, launch_claude_cli,
    save_shortcut_setting,
};
use services::settings_store;
use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            let settings = settings_store::load_settings();

            if let Some(shortcut) = platform::parse_shortcut(&settings.shortcut) {
                let app_handle = app.handle().clone();

                app.global_shortcut()
                    .on_shortcut(shortcut, move |_app, _shortcut, event| {
                        if event.state() != ShortcutState::Pressed {
                            return;
                        }
                        if let Some(window) = app_handle.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                                let _ = window.emit("overlay-visibility", false);
                            } else {
                                let _ = window.show();
                                let _ = window.emit("overlay-visibility", true);
                            }
                        }
                    })?;
            }

            // Platform-specific window positioning (skip on first launch - will be centered by frontend)
            if !settings.first_launch {
                if let Some(window) = app.get_webview_window("main") {
                    if let Ok(Some(monitor)) = window.current_monitor() {
                        let position = monitor.position();

                        #[cfg(target_os = "macos")]
                        let (margin_x, margin_y) = (20, 30);

                        #[cfg(target_os = "linux")]
                        let (margin_x, margin_y) = (20, 40);

                        #[cfg(target_os = "windows")]
                        let (margin_x, margin_y) = (20, 20);

                        #[cfg(not(any(
                            target_os = "macos",
                            target_os = "linux",
                            target_os = "windows"
                        )))]
                        let (margin_x, margin_y) = (20, 20);

                        let _ = window.set_position(tauri::PhysicalPosition::new(
                            position.x + margin_x,
                            position.y + margin_y,
                        ));
                    }
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            check_credentials,
            fetch_usage_data,
            get_credentials_path_cmd,
            get_settings,
            save_shortcut_setting,
            complete_first_launch,
            get_platform_info,
            center_settings_window,
            launch_claude_cli
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
