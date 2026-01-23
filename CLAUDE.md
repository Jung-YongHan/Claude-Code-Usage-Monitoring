# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Code Usage Monitor is a lightweight Tauri desktop application that displays real-time API usage metrics for Claude Code users. It monitors 5-hour, 7-day, and model-specific quotas with automatic refresh and visual status indicators.

## Build & Development Commands

```bash
npm install              # Install dependencies
npm run tauri dev        # Run in development mode (Vite + Tauri)
npm run tauri build      # Build for current platform (outputs to src-tauri/target/release/)
```

**Prerequisites**: Node.js v18+, Rust toolchain

## Architecture

### Two-Part Architecture: React Frontend + Rust Backend

**Frontend (TypeScript/React)** in `src/`:
- React 19, Vite 6, Tailwind CSS 4, TanStack Query 5, Zustand
- `services/tauri-commands.ts` - IPC layer to invoke Rust commands
- `hooks/useAuth.ts`, `hooks/useUsageData.ts` - TanStack Query wrappers with auto-refresh
- `hooks/useSettings.ts`, `hooks/useKeyCapture.ts` - Settings and keyboard shortcut capture
- `components/Overlay/` - Minimal HUD mode, `components/Dashboard/` - Full view
- `components/ShortcutSettings/` - First-launch and shortcut configuration UI
- `components/LoginRequired/` - Claude CLI login instructions

**Backend (Rust/Tauri)** in `src-tauri/`:
- `lib.rs` - Tauri setup, global shortcut handler, platform-specific window positioning
- `commands/mod.rs` - Tauri commands: `check_credentials`, `fetch_usage_data`, `get_settings`, `save_shortcut_setting`, `get_platform_info`, etc.
- `services/credential_store.rs` - Reads `~/.claude/.credentials.json` (created by Claude CLI)
- `services/anthropic_api.rs` - Calls `https://api.anthropic.com/api/oauth/usage` with OAuth token
- `services/settings_store.rs` - Persists app settings (shortcut config, first_launch flag)
- `platform.rs` - Cross-platform shortcut parsing and platform detection

### Data Flow

1. App reads credentials from `~/.claude/.credentials.json` (must exist from Claude CLI)
2. Frontend invokes Rust commands via Tauri's `invoke()` API
3. Rust validates token expiration, fetches usage data from Anthropic API
4. Returns metrics: `five_hour`, `seven_day`, `seven_day_opus`, `seven_day_sonnet`

### Key Technical Details

- **API Header**: Requires `anthropic-beta: oauth-2025-04-20`
- **Window Config**: 380x360 default, 140x75 minimum; always-on-top, skip-taskbar, overlay title bar
- **Global Shortcut**: Configurable (default varies by platform), toggles window visibility
- **Color Coding**: Green (0-50%), Yellow (50-75%), Orange (75-90%), Red (90-100%)
- **Dev Server**: Vite runs on port 1420
- **First Launch**: Settings window for shortcut configuration on first run

## Release & CI/CD

GitHub Actions workflow (`.github/workflows/release.yml`) triggers on `v*` tags and builds:
- macOS: `.dmg` (universal binary for ARM64 + Intel)
- Windows: `.msi` + `.exe` (NSIS installer)
- Linux: `.deb` + `.AppImage`
