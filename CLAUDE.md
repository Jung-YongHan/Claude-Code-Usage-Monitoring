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

**Testing First Launch**:
```bash
rm ~/.claude-usage-monitor/settings.json  # Reset to first launch state
npm run tauri dev
```

## Architecture

### Two-Part Architecture: React Frontend + Rust Backend

**Frontend (TypeScript/React)** in `src/`:
- React 19, Vite 6, Tailwind CSS 4, TanStack Query 5, Zustand
- `services/tauri-commands.ts` - IPC layer to invoke Rust commands
- `services/types.ts` - Shared TypeScript types (LayoutType, AppSettings, etc.)
- `hooks/useAuth.ts`, `hooks/useUsageData.ts` - TanStack Query wrappers with auto-refresh
- `hooks/useSettings.ts` - Settings management (shortcut, layout, first launch)
- `hooks/useKeyCapture.ts` - Keyboard shortcut capture
- `utils/colors.ts` - Color utilities (`getUsageColor`, `getUsageColorClass`)
- `components/Overlay/` - Simple layout (compact text-based display)
- `components/Dashboard/` - Detailed layout (cards with progress bars)
- `components/OnboardingWizard/` - First-launch wizard (3 steps)
- `components/ShortcutSettings/` - Shortcut configuration UI
- `components/LoginRequired/` - Claude CLI login instructions

**Backend (Rust/Tauri)** in `src-tauri/`:
- `lib.rs` - Tauri setup, global shortcut handler, platform-specific window positioning
- `commands/mod.rs` - Tauri commands (see Commands section below)
- `services/credential_store.rs` - Reads `~/.claude/.credentials.json` (created by Claude CLI)
- `services/anthropic_api.rs` - Calls `https://api.anthropic.com/api/oauth/usage` with OAuth token
- `services/settings_store.rs` - Persists app settings to `~/.claude-usage-monitor/settings.json`
- `platform.rs` - Cross-platform shortcut parsing and platform detection

### Tauri Commands

| Command | Description |
|---------|-------------|
| `check_credentials` | Validates Claude CLI credentials |
| `fetch_usage_data` | Fetches usage metrics from Anthropic API |
| `get_settings` | Returns current app settings |
| `save_shortcut_setting` | Saves keyboard shortcut configuration |
| `save_layout_setting` | Saves layout type (simple/detailed) |
| `complete_first_launch` | Marks onboarding as complete |
| `get_platform_info` | Returns platform name and capabilities |
| `center_settings_window` | Centers the settings window on screen |
| `set_window_size` | Sets window dimensions |
| `launch_claude_cli` | Opens terminal with Claude CLI login |
| `close_claude_terminal` | Closes the Claude CLI terminal |

### Data Flow

1. App reads credentials from `~/.claude/.credentials.json` (must exist from Claude CLI)
2. Frontend invokes Rust commands via Tauri's `invoke()` API
3. Rust validates token expiration, fetches usage data from Anthropic API
4. Returns metrics: `five_hour`, `seven_day`, `seven_day_opus`, `seven_day_sonnet`

## Layout Types

| Layout | Window Size | Description |
|--------|-------------|-------------|
| Simple | 140×75 | Compact text-based display (Overlay component) |
| Detailed | 380×360 | Cards with progress bars (Dashboard component) |

## Onboarding Flow

First launch shows a 3-step wizard:

1. **Account Connection** (Step 1) - Claude CLI authentication
2. **Layout Selection** (Step 2) - Choose Simple or Detailed layout with live preview
3. **Shortcut Settings** (Step 3) - Configure global keyboard shortcut

### Settings File Structure

Settings are stored in `~/.claude-usage-monitor/settings.json`:

```json
{
  "shortcut": { "modifier": "super+shift", "key": "u" },
  "first_launch": false,
  "layout": { "layout_type": "simple" }
}
```

## Key Technical Details

- **API Header**: Requires `anthropic-beta: oauth-2025-04-20`
- **Window Config**: Always-on-top, skip-taskbar, overlay title bar
- **Global Shortcut**: Platform-specific defaults (macOS: Cmd+Shift+U, Windows: Alt+R, Linux: Ctrl+Shift+U)
- **Color Coding**: Green (0-50%), Yellow (50-75%), Orange (75-90%), Red (90-100%)
- **Color Utilities**: Use `getUsageColor()` for hex colors, `getUsageColorClass()` for Tailwind classes
- **Dev Server**: Vite runs on port 1420

## Release & CI/CD

GitHub Actions workflow (`.github/workflows/release.yml`) triggers on `v*` tags and builds:
- macOS: `.dmg` (universal binary for ARM64 + Intel)
- Windows: `.msi` + `.exe` (NSIS installer)
- Linux: `.deb` + `.AppImage`
