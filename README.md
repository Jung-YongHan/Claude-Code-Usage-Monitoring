# Claude Code Usage Monitor

A lightweight desktop application that displays real-time API usage metrics for Claude Code users. Monitor your 5-hour, 7-day, and model-specific quotas with automatic refresh and visual status indicators.

## What is This?

Claude Code is Anthropic's official CLI tool for interacting with Claude. When using Claude Code, your usage is tracked against various quotas (5-hour rolling window, 7-day limits, model-specific caps). This desktop app provides an always-visible overlay to monitor these quotas in real-time, helping you manage your usage effectively.

## Features

- **Real-time Usage Tracking**: Monitor your Claude Code API consumption at a glance
- **Multiple Quota Views**: 5-hour, 7-day total, 7-day Opus, and 7-day Sonnet usage
- **Auto-refresh**: Updates every minute automatically
- **Color-coded Status**: Visual indicators from green (low usage) to red (near limit)
  - Green: 0-50%
  - Yellow: 50-75%
  - Orange: 75-90%
  - Red: 90-100%
- **Minimal Overlay Mode**: Compact HUD that stays on top of other windows
- **Global Keyboard Shortcut**: Toggle visibility instantly (customizable)
- **Cross-platform**: Works on Windows, macOS, and Linux

## Installation

### Download Pre-built Releases

Download the latest release for your platform from the [Releases](https://github.com/your-username/Claude-Code-Usage-Monitoring-Desktop-Application/releases) page:

- **Windows**: `.msi` or `.exe` installer
- **macOS**: `.dmg` (universal binary for Apple Silicon and Intel)
- **Linux**: `.deb` or `.AppImage`

### Prerequisites

Before using this app, you must have:

1. [Claude Code CLI](https://claude.ai/code) installed and logged in
2. Valid credentials at `~/.claude/.credentials.json` (created automatically when you log into Claude Code CLI)

## Usage

### First Launch

1. Launch the application
2. Configure your preferred global shortcut key (or use the default)
3. If you see "Login Required", run `claude` in your terminal and complete the login process

### Dashboard View

The main dashboard displays:
- **5-Hour Usage**: Rolling 5-hour consumption window
- **7-Day Usage**: Total usage over the past 7 days
- **7-Day Opus**: Opus model-specific usage
- **7-Day Sonnet**: Sonnet model-specific usage

### Overlay Mode

Click the minimize button to switch to a compact overlay that shows essential metrics while staying out of your way.

### Keyboard Shortcut

Use the configured global shortcut to quickly show/hide the window:
- **Windows/Linux**: Default `Ctrl+Shift+U`
- **macOS**: Default `Cmd+Shift+U`

You can customize this in the settings.

## Building from Source

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Rust](https://rustup.rs/) toolchain
- Platform-specific build tools:
  - **Windows**: Visual Studio Build Tools or MSYS2 MinGW
  - **macOS**: Xcode Command Line Tools
  - **Linux**: `build-essential`, `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`

### Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev
```

### Production Build

```bash
# Build for your current platform
npm run tauri build
```

Built artifacts are output to `src-tauri/target/release/`.

## How It Works

1. **Credential Reading**: The app reads OAuth tokens from `~/.claude/.credentials.json` (created by Claude Code CLI)
2. **Token Validation**: Checks if the token is valid and not expired
3. **API Fetching**: Calls `https://api.anthropic.com/api/oauth/usage` to retrieve usage data
4. **Display**: Shows metrics with color-coded progress bars

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 6 + Tailwind CSS 4
- **Backend**: Tauri 2 (Rust)
- **State Management**: TanStack Query 5 + Zustand
- **API**: Anthropic OAuth Usage API

## Project Structure

```
├── src/                          # React frontend
│   ├── components/
│   │   ├── Dashboard/            # Main dashboard view
│   │   ├── Overlay/              # Minimal HUD mode
│   │   ├── LoginRequired/        # Login instructions
│   │   └── ShortcutSettings/     # Shortcut configuration
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # Tauri IPC layer
│   └── utils/                    # Helper functions
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── commands/             # Tauri command handlers
│   │   ├── models/               # Data structures
│   │   ├── services/             # Credential & API services
│   │   └── lib.rs                # App setup & shortcuts
│   └── tauri.conf.json           # Tauri configuration
└── package.json
```

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Built with [Tauri](https://tauri.app/)
- Powered by [Claude](https://claude.ai/) from Anthropic
