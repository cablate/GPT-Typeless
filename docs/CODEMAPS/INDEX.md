# GPT-Typeless Codemap

**Last Updated:** 2025-01-24
**Project Version:** 1.0.0

---

## Overview

GPT-Typeless 是一款基於 Tauri + React 的桌面應用程式，提供一鍵錄音並透過 ChatGPT API 進行即時語音轉文字的功能。

```
+------------------+        +------------------+        +------------------+
|   Frontend       | <----> |   Tauri Bridge   | <----> |    Backend       |
|   (React)        |        |   (IPC Commands) |        |    (Rust)        |
+------------------+        +------------------+        +------------------+
        |                            |                            |
        v                            v                            v
   UI Components              invoke() Calls               Audio/API/Hotkey
```

---

## Architecture

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 19.1.0 |
| Language | TypeScript | 5.8.3 |
| Build Tool | Vite | 7.0.4 |
| Styling | Tailwind CSS | 3.4.19 |
| Icons | Lucide React | 0.562.0 |
| Desktop Framework | Tauri | 2.x |
| Backend Language | Rust | 2021 Edition |

### Project Structure

```
gptservice-tauri/
├── src/                                    # Frontend (React + TypeScript)
│   ├── components/
│   │   ├── features/                       # Feature Components
│   │   │   ├── RecordingControl.tsx        # 錄音控制組件
│   │   │   ├── TranscriptionResult.tsx     # 轉錄結果顯示
│   │   │   ├── TimerDisplay.tsx            # 計時器顯示
│   │   │   ├── SettingsModal.tsx           # 設定對話框
│   │   │   ├── StatusPanel.tsx             # 狀態面板
│   │   │   └── index.ts
│   │   ├── layout/                         # Layout Components
│   │   │   ├── Header.tsx                  # 頁首
│   │   │   ├── Footer.tsx                  # 頁尾
│   │   │   ├── MainContent.tsx             # 主要內容區
│   │   │   └── index.ts
│   │   └── ui/                             # UI Components
│   │       ├── Button.tsx                  # 按鈕組件
│   │       ├── Input.tsx                   # 輸入框組件
│   │       ├── Select.tsx                  # 下拉選單組件
│   │       ├── Modal.tsx                   # 彈窗組件
│   │       ├── StatusBadge.tsx             # 狀態標籤
│   │       ├── Toast.tsx                   # 提示訊息
│   │       ├── ProgressStepper.tsx         # 進度步驟
│   │       └── index.ts
│   ├── hooks/                              # React Hooks
│   │   ├── useToast.ts                     # Toast hook
│   │   ├── useFocusTrap.ts                 # Focus trap hook
│   │   ├── useMediaQuery.ts                # Media query hook
│   │   ├── useReducedMotion.ts             # Reduced motion hook
│   │   └── index.ts
│   ├── design-tokens/                      # Design System
│   │   ├── colors.ts                       # Color variables
│   │   ├── spacing.ts                      # Spacing variables
│   │   ├── typography.ts                   # Typography variables
│   │   ├── border-radius.ts                # Border radius variables
│   │   ├── shadows.ts                      # Shadow variables
│   │   ├── transitions.ts                  # Transition variables
│   │   └── index.ts
│   ├── utils/                              # Utility Functions
│   │   ├── index.ts
│   │   └── accessibility.ts                # Accessibility utilities
│   ├── App.tsx                             # Main Application Component
│   ├── App.css                             # Application Styles
│   ├── main.tsx                            # Entry Point
│   └── vite-env.d.ts                       # Vite Type Definitions
├── src-tauri/                              # Backend (Rust)
│   ├── src/
│   │   ├── lib.rs                          # Core Logic, Tauri Commands
│   │   ├── audio.rs                        # Audio Recording (cpal)
│   │   ├── api.rs                          # ChatGPT API Client (reqwest)
│   │   ├── hotkey.rs                       # Global Hotkey (global-hotkey)
│   │   └── main.rs                         # Entry Point
│   ├── icons/                              # Application Icons
│   ├── capabilities/                       # Tauri Permissions
│   │   └── default.json
│   ├── Cargo.toml                          # Rust Dependencies
│   ├── build.rs                            # Build Script
│   └── tauri.conf.json                     # Tauri Configuration
├── public/                                 # Static Assets
│   ├── demo.png                            # Demo Image
│   ├── favicon.png                         # Favicon
│   ├── tauri.svg                           # Tauri Icon
│   └── vite.svg                            # Vite Icon
├── docs/                                   # Documentation
│   └── CODEMAPS/                           # Architecture Documentation
├── .github/                                # GitHub Configuration
│   └── workflows/
│       └── release.yml                     # Release Workflow
├── index.html                              # HTML Entry
├── package.json                            # Node.js Dependencies
├── vite.config.ts                          # Vite Configuration
├── tsconfig.json                           # TypeScript Configuration
├── tsconfig.node.json                      # TypeScript Node Config
├── tailwind.config.js                      # Tailwind Configuration
├── postcss.config.js                       # PostCSS Configuration
├── README.md                               # Project README
├── CHANGELOG.md                            # Version Changelog
├── CONTRIBUTING.md                         # Contributing Guide
└── LICENSE                                 # MIT License
```

---

## Key Modules

### Frontend Modules

| Module | Purpose | Location |
|--------|---------|----------|
| App | Main application, state management | `src/App.tsx` |
| Recording Control | Recording button, device selector | `src/components/features/RecordingControl.tsx` |
| Settings Modal | Configuration panel | `src/components/features/SettingsModal.tsx` |
| Design Tokens | Design system variables | `src/design-tokens/` |
| UI Components | Reusable UI components | `src/components/ui/` |

### Backend Modules

| Module | Purpose | Location |
|--------|---------|----------|
| lib.rs | Tauri commands, state management | `src-tauri/src/lib.rs` |
| audio.rs | Audio recording (cpal) | `src-tauri/src/audio.rs` |
| api.rs | ChatGPT transcription API | `src-tauri/src/api.rs` |
| hotkey.rs | Global hotkey handling | `src-tauri/src/hotkey.rs` |

---

## Tauri Commands

| Command | Parameters | Returns | Description |
|---------|------------|---------|-------------|
| `start_recording` | `device_name?: string` | `string` (recording_id) | Start audio recording |
| `stop_recording` | - | `{audio_path, duration}` | Stop recording and save |
| `get_recording_status` | - | `{is_recording, recording_id}` | Get current recording state |
| `list_audio_devices` | - | `AudioDevice[]` | List available audio devices |
| `transcribe_audio` | `audio_path: string` | `string` (transcribed text) | Transcribe audio via ChatGPT API |
| `copy_to_clipboard` | `text: string` | - | Copy text to clipboard |
| `get_config_command` | - | `AppConfig` | Get application configuration |
| `set_config` | `config: AppConfig` | - | Save configuration |
| `cleanup_old_recordings` | `days?: number` | `string` (result message) | Delete old audio files |
| `health_check` | - | `HealthStatus` | Application health status |
| `get_transcription_history` | - | `TranscriptionHistory[]` | Get recent transcriptions |
| `delete_history_item` | `id: string` | - | Delete single history item |
| `clear_all_history` | - | - | Clear all history |

---

## Data Flow

### Recording Flow

```
User presses hotkey (Ctrl+Shift+R)
        |
        v
+------------------+
| hotkey.rs        | Emit "hotkey-triggered" event
+------------------+
        |
        v
+------------------+
| App.tsx          | Receives event via listen()
| handleMouseDown() | Calls invoke("start_recording")
+------------------+
        |
        v
+------------------+
| audio.rs         | Start cpal recording stream
+------------------+
        |
        v
User releases hotkey
        |
        v
+------------------+
| App.tsx          | handleMouseUp()
|                  | Calls invoke("stop_recording")
+------------------+
        |
        v
+------------------+
| audio.rs         | Stop recording, save WAV file
+------------------+
        |
        v
+------------------+
| App.tsx          | Calls invoke("transcribe_audio")
+------------------+
        |
        v
+------------------+
| api.rs           | Send to ChatGPT API
+------------------+
        |
        v
+------------------+
| App.tsx          | Display result, copy to clipboard
+------------------+
```

---

## External Dependencies

### Frontend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@tauri-apps/api` | ^2 | Tauri API |
| `@tauri-apps/plugin-opener` | ^2 | Open URLs in system browser |
| `lucide-react` | ^0.562.0 | Icon library |
| `react` | ^19.1.0 | UI framework |
| `react-dom` | ^19.1.0 | React DOM renderer |
| `tailwindcss` | ^3.4.19 | Styling |

### Backend Dependencies (Rust)

| Package | Version | Purpose |
|---------|---------|---------|
| `tauri` | ^2 | Desktop framework |
| `tauri-plugin-opener` | ^2 | Open URLs |
| `serde` | ^1 | Serialization |
| `serde_json` | ^1 | JSON parsing |
| `cpal` | ^0.15 | Audio recording |
| `hound` | ^3.5 | WAV encoding |
| `global-hotkey` | ^0.5 | Global hotkeys |
| `arboard` | ^3.3 | Clipboard access |
| `reqwest` | ^0.12 | HTTP client |
| `tokio` | ^1 | Async runtime |
| `chrono` | ^0.4 | Time handling |
| `tray-icon` | ^0.19 | System tray |
| `image` | ^0.25 | Image handling |

---

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Node.js dependencies and scripts |
| `src-tauri/Cargo.toml` | Rust dependencies |
| `src-tauri/tauri.conf.json` | Tauri application config |
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
| `.github/workflows/release.yml` | GitHub Actions release workflow |

---

## Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (http://localhost:1420) |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build |
| `npm run tauri dev` | Start Tauri development mode |
| `npm run tauri build` | Build Tauri application |
| `npm run tauri info` | Show Tauri environment info |

---

## Related Documentation

- [README.md](../../README.md) - Project overview and setup
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Contributing guidelines
- [CHANGELOG.md](../../CHANGELOG.md) - Version history
- [Frontend Codemap](./frontend.md) - Frontend architecture details
- [Backend Codemap](./backend.md) - Backend architecture details
