mod commands;
mod models;
mod services;

use commands::{check_credentials, fetch_usage_data, get_credentials_path_cmd};
use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            // Register Alt+R shortcut
            let shortcut = Shortcut::new(Some(Modifiers::ALT), Code::KeyR);
            let app_handle = app.handle().clone();

            app.global_shortcut().on_shortcut(shortcut, move |_app, _shortcut, event| {
                // Only toggle on key press, not release
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

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            check_credentials,
            fetch_usage_data,
            get_credentials_path_cmd
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
