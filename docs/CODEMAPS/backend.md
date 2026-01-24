# Backend Architecture

**Last Updated:** 2025-01-24
**Runtime:** Tauri 2.x + Rust 2021 Edition
**Entry Point:** `src-tauri/src/main.rs`

---

## Overview

後端使用 Rust 編寫，通過 Tauri 框架提供系統級功能和 API。主要功能包括音訊錄製、ChatGPT API 整合、全域快捷鍵和剪貼簿操作。

---

## Structure

```
src-tauri/
├── src/
│   ├── main.rs           # 應用程式進入點
│   ├── lib.rs            # 核心邏輯、Tauri commands
│   ├── audio.rs          # 音訊錄製模組
│   ├── api.rs            # ChatGPT API 客戶端
│   └── hotkey.rs         # 全域快捷鍵模組
├── icons/                # 應用程式圖示
├── capabilities/          # Tauri 權限配置
│   └── default.json
├── Cargo.toml            # Rust 依賴配置
├── build.rs              # 構建腳本
└── tauri.conf.json       # Tauri 應用配置
```

---

## Key Modules

### main.rs

應用程式進入點，負責初始化 Tauri 應用：

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    gptservice_tauri_lib::run()
}
```

### lib.rs

核心模組，包含：

- 應用狀態管理 (`AppState`)
- 配置管理 (`get_config`, `save_config`)
- 歷史記錄管理 (`get_history_path`, `add_to_history`)
- Tauri commands 實現

**應用狀態：**

```rust
pub struct AppState {
    pub audio_manager: Mutex<AudioManager>,
}
```

**配置結構：**

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default)]
pub struct AppConfig {
    pub chatgpt_token: String,
    pub oai_client_build_number: String,
    pub oai_client_version: String,
    pub oai_device_id: String,
    pub hotkey: String,
    pub recording_format: String,
    pub audio_device: Option<String>,
}
```

### audio.rs

音訊錄製模組，使用 `cpal` 和 `hound`：

| Function | Purpose |
|----------|---------|
| `AudioManager::new()` | 初始化音訊管理器 |
| `start_recording()` | 開始錄製音訊 |
| `stop_recording()` | 停止錄製並保存 WAV 檔案 |
| `list_devices()` | 列出可用錄音設備 |
| `cleanup_old_recordings()` | 清理舊錄音檔案 |

**錄音設備：**

```rust
pub struct AudioDevice {
    pub name: String,
    pub is_default: bool,
}
```

**錄音結果：**

```rust
pub struct StopRecordingResult {
    pub audio_path: String,
    pub duration: u64,
}
```

### api.rs

ChatGPT API 客戶端，使用 `reqwest`：

| Function | Purpose |
|----------|---------|
| `TranscribeClient::new()` | 使用 Token 建立客戶端 |
| `TranscribeClient::from_fields()` | 使用完整欄位建立客戶端 |
| `transcribe()` | 發送音訊檔案進行轉錄 |

**轉錄結果：**

```rust
pub struct TranscriptionResult {
    pub text: String,
}
```

**API 端點：** `https://chatgpt.com/backend-api//transcription`

### hotkey.rs

全域快捷鍵模組，使用 `global-hotkey`：

| Type/Function | Purpose |
|---------------|---------|
| `HotkeyManager` | 快捷鍵管理器 |
| `AppHotkey` | 應用程式快捷鍵結構 |
| `from_string()` | 從字串解析快捷鍵 |
| `get_hotkey_event_receiver()` | 獲取快捷鍵事件接收器 |

**快捷鍵事件：**

```rust
pub struct HotkeyEvent {
    pub hotkey_id: String,
    pub state: HotKeyState,  // Pressed or Released
}
```

---

## Tauri Commands

所有通過 `#[tauri::command]` 宏註冊的命令：

### Recording Commands

| Command | Parameters | Returns | Description |
|---------|------------|---------|-------------|
| `start_recording` | `device_name: Option<String>` | `String` (recording_id) | 開始錄音 |
| `stop_recording` | - | `StopRecordingResult` | 停止錄音 |
| `get_recording_status` | - | `RecordingStatus` | 獲取錄音狀態 |
| `list_audio_devices` | - | `Vec<AudioDevice>` | 列出錄音設備 |

### Transcription Commands

| Command | Parameters | Returns | Description |
|---------|------------|---------|-------------|
| `transcribe_audio` | `audio_path: String` | `String` (transcribed text) | 轉錄音訊 |

### Configuration Commands

| Command | Parameters | Returns | Description |
|---------|------------|---------|-------------|
| `get_config_command` | - | `AppConfig` | 獲取配置 |
| `set_config` | `config: AppConfig` | - | 保存配置 |

### History Commands

| Command | Parameters | Returns | Description |
|---------|------------|---------|-------------|
| `get_transcription_history` | - | `Vec<TranscriptionHistory>` | 獲取歷史 |
| `delete_history_item` | `id: String` | - | 刪除單筆 |
| `clear_all_history` | - | - | 清空歷史 |

### Utility Commands

| Command | Parameters | Returns | Description |
|---------|------------|---------|-------------|
| `copy_to_clipboard` | `text: String` | - | 複製到剪貼簿 |
| `cleanup_old_recordings` | `days: Option<u64>` | `String` (message) | 清理舊檔案 |
| `health_check` | - | `HealthStatus` | 健康檢查 |

---

## File Operations

### Configuration File

**位置：** `{current_dir}/gptservice-config.json`

**格式：**

```json
{
  "chatgpt_token": "eyJhbGciOiJSUzI1NiIs...",
  "oai_client_build_number": "4228200",
  "oai_client_version": "prod-113d17ee277d09e29075aec611394c0efe23d0e0",
  "oai_device_id": "8f0b7aa2-af16-4225-a667-69a9be96d046",
  "hotkey": "Ctrl+Shift+R",
  "recording_format": "wav",
  "audio_device": "微陣列麥克風"
}
```

### History File

**位置：** `{current_dir}/gptservice-history.json`

**格式：**

```json
[
  {
    "id": "1737657600000",
    "text": "你好，這是一段測試音訊。",
    "duration": 5,
    "timestamp": 1737657600000
  }
]
```

### Audio Files

**位置：** `{current_dir}/recordings/`

**命名：** `{timestamp}.wav`

---

## Data Flow

```
+------------------+        +------------------+        +------------------+
|   Frontend       |        |   Tauri Bridge   |        |     Modules      |
|   (React)        | <----> |   (Commands)     | <----> |   (Rust)         |
+------------------+        +------------------+        +------------------+
                                      |                            |
                                      |                            |
                                      v                            v
                            +------------------+        +------------------+
                            |  File System     |        |   System APIs    |
                            |  - Config        |        |   - Audio        |
                            |  - History       |        |   - Clipboard    |
                            |  - Recordings    |        |   - Hotkey       |
                            +------------------+        +------------------+
```

---

## Dependencies

### Rust Dependencies (Cargo.toml)

| Package | Version | Purpose |
|---------|---------|---------|
| `tauri` | ^2 | Desktop framework |
| `tauri-plugin-opener` | ^2 | Open URLs in browser |
| `serde` | ^1 | Serialization framework |
| `serde_json` | ^1 | JSON parsing |
| `cpal` | ^0.15 | Audio input/output |
| `hound` | ^3.5 | WAV file encoding |
| `global-hotkey` | ^0.5 | Global hotkeys |
| `arboard` | ^3.3 | Clipboard access |
| `reqwest` | ^0.12 | HTTP client |
| `tokio` | ^1 | Async runtime |
| `chrono` | ^0.4 | Date/time utilities |
| `tray-icon` | ^0.19 | System tray icon |
| `image` | ^0.25 | Image processing |

---

## System Tray

在 Windows 上支援系統托盤功能：

```rust
#[cfg(target_os = "windows")]
{
    use tray_icon::{TrayIconBuilder, menu::Menu, menu::MenuItem};

    let path = std::path::PathBuf::from("src-tauri/icons/icon.ico");

    let _ = TrayIconBuilder::new()
        .with_tooltip("GPTService - 按熱鍵開始錄音")
        .build();
}
```

---

## Error Handling

所有命令返回 `Result<T, String>`：

```rust
#[tauri::command]
pub fn start_recording(
    device_name: Option<String>,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let manager = state.audio_manager.lock()
        .map_err(|e| format!("無法存取 AudioManager: {}", e))?;

    manager.start_recording(device_name)
}
```

---

## Related Documentation

- [Frontend Codemap](./frontend.md) - Frontend architecture details
- [INDEX.md](./INDEX.md) - Overall project architecture
