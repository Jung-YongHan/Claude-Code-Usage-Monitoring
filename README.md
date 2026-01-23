# Claude Code Usage Monitor

Claude Code 사용량을 모니터링하는 경량 데스크톱 앱입니다.

## Features

- 5시간 사용량 표시
- 7일 사용량 표시
- 7일 Opus 사용량 표시
- 자동 갱신 (1분마다)
- 색상 코딩 (Green → Yellow → Orange → Red)
- 시스템 트레이 지원

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Rust](https://rustup.rs/) (MSYS2 MinGW 또는 Visual Studio Build Tools)
- Claude Code CLI가 설치되어 있고 로그인된 상태

## Development

```bash
# 의존성 설치
npm install

# 개발 모드로 실행
npm run tauri dev
```

## Build

```bash
# 프로덕션 빌드
npm run tauri build
```

빌드된 앱은 `src-tauri/target/release/` 디렉토리에 생성됩니다.

## How It Works

1. 앱 시작 시 `~/.claude/.credentials.json` 파일에서 OAuth 토큰을 읽습니다.
2. 토큰이 없거나 만료되면 Claude CLI 로그인 안내를 표시합니다.
3. 토큰이 유효하면 `https://api.anthropic.com/api/oauth/usage` API를 호출하여 사용량 데이터를 가져옵니다.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Tauri 2 (Rust)
- **State Management**: TanStack Query + Zustand
- **API**: Anthropic OAuth Usage API

## Project Structure

```
├── src/                          # React frontend
│   ├── components/               # UI components
│   ├── hooks/                    # Custom hooks
│   ├── services/                 # API layer
│   └── utils/                    # Helpers
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── commands/             # Tauri commands
│   │   ├── models/               # Data structures
│   │   └── services/             # Business logic
│   └── tauri.conf.json           # Tauri config
└── package.json
```
