# Frontend Architecture

**Last Updated:** 2025-01-24
**Framework:** React 19.1.0 + TypeScript 5.8.3
**Entry Point:** `src/main.tsx`

---

## Overview

前端使用 React + TypeScript 構建，採用函數元件和 Hooks 的現代開發模式。UI 使用 Tailwind CSS 進行樣式設計，並通過 Tauri invoke API 與後端進行通信。

---

## Structure

```
src/
├── main.tsx                 # 應用程式進入點
├── App.tsx                  # 主應用組件
├── App.css                  # 全局樣式
├── vite-env.d.ts            # Vite 類型定義
├── components/              # 組件目錄
│   ├── features/            # 功能組件
│   ├── layout/              # 版面組件
│   └── ui/                  # 通用 UI 組件
├── hooks/                   # 自定義 Hooks
├── design-tokens/           # 設計系統變數
└── utils/                   # 工具函數
```

---

## Key Components

### Main Application (App.tsx)

主應用組件包含所有狀態管理和業務邏輯：

| State | Type | Purpose |
|-------|------|---------|
| `devices` | `AudioDevice[]` | 可用錄音設備列表 |
| `recordingStatus` | `RecordingStatus` | 當前錄音狀態 |
| `config` | `AppConfig` | 應用程式配置 |
| `history` | `TranscriptionHistory[]` | 轉錄歷史記錄 |
| `transcriptionResult` | `string \| null` | 當前轉錄結果 |
| `steps` | `Step[]` | 流程步驟狀態 |

**核心函數：**

- `loadDevices()` - 載入錄音設備
- `loadConfig()` - 載入配置
- `loadHistory()` - 載入轉錄歷史
- `handleMouseDown()` - 開始錄音
- `handleMouseUp()` - 停止錄音並轉錄
- `saveConfig()` - 保存配置

### Feature Components

#### RecordingControl.tsx

錄音控制卡片組件，提供：
- 錄音狀態指示器
- 錄音設備選擇器
- 錄音/停止按鈕
- 快捷鍵提示

#### SettingsModal.tsx

設定對話框組件，提供：
- ChatGPT Token 輸入
- API 參數配置（build-number, version, device-id）
- 快捷鍵設置
- 錄音設備選擇
- 舊錄音清理功能

#### TranscriptionResult.tsx

轉錄結果顯示組件，提供：
- 轉錄文字展示
- 一鍵複製功能

#### TimerDisplay.tsx

計時器顯示組件，顯示：
- 錄音時長
- 轉錄耗時

#### StatusPanel.tsx

狀態面板組件，顯示：
- 當前狀態訊息
- 錯誤訊息
- 流程步驟進度

### Layout Components

#### Header.tsx

頁首組件，包含：
- 應用程式標題
- 錄音狀態指示
- 錄音控制按鈕
- 設定按鈕

#### Footer.tsx

頁尾組件，顯示版本資訊。

#### MainContent.tsx

主要內容區組件，包裝所有主要內容。

### UI Components

可重用的通用 UI 組件：

| Component | Props | Purpose |
|-----------|-------|---------|
| Button | `variant`, `size`, `fullWidth`, `icon` | 可配置的按鈕 |
| Input | `label`, `type`, `placeholder`, `fullWidth` | 輸入框 |
| Select | `label`, `options`, `value`, `onChange` | 下拉選單 |
| Modal | `isOpen`, `onClose`, `title`, `size` | 彈窗對話框 |
| StatusBadge | `variant`, `withDot`, `animated` | 狀態標籤 |
| Toast | `message`, `type` | 提示訊息 |
| ProgressStepper | `steps` | 進度步驟顯示 |

---

## Hooks

自定義 React Hooks：

| Hook | Purpose |
|------|---------|
| `useToast` | Toast 提示訊息管理 |
| `useFocusTrap` | 彈窗內焦點陷阱 |
| `useMediaQuery` | 響應式媒體查詢 |
| `useReducedMotion` | 檢測用戶的動畫偏好 |

---

## Design Tokens

設計系統變數，定義一致的外觀：

| File | Purpose |
|------|---------|
| `colors.ts` | 顏色變數（主色、次要色、背景色、文字色） |
| `spacing.ts` | 間距變數（xs, sm, md, lg, xl） |
| `typography.ts` | 字體大小和行高 |
| `border-radius.ts` | 邊框圓角 |
| `shadows.ts` | 陰影效果 |
| `transitions.ts` | 過渡動畫 |

---

## Data Flow

```
+------------+     invoke()     +------------------+
|   React    | <---------------> |   Tauri Backend  |
| Component  |                 |   (Rust)         |
+------------+                 +------------------+
       |                               |
       v                               v
+------------+                 +------------------+
|   State    |                 |   File System    |
|  Updates   |                 |   / Clipboard    |
+------------+                 +------------------+
```

### Tauri Invoke Calls

前端通過 `invoke()` 函數調用後端指令：

```typescript
import { invoke } from "@tauri-apps/api/core";

// 獲取設備列表
const devices = await invoke<AudioDevice[]>("list_audio_devices");

// 開始錄音
const recordingId = await invoke<string>("start_recording", {
  deviceName: selectedDevice
});

// 停止錄音
const result = await invoke<{audio_path: string; duration: number}>("stop_recording");

// 轉錄音訊
const text = await invoke<string>("transcribe_audio", { audioPath });

// 複製到剪貼簿
await invoke("copy_to_clipboard", { text });
```

---

## Event Handling

### Hotkey Events

通過 Tauri event system 監聽全域快捷鍵：

```typescript
import { listen } from "@tauri-apps/api/event";

const unlisten = listen<boolean>("hotkey-triggered", (event) => {
  const isPressed = event.payload;
  if (isPressed) {
    handleMouseDown();  // 開始錄音
  } else {
    handleMouseUp();    // 停止錄音
  }
});
```

---

## Styling

### Tailwind CSS

使用 Tailwind utility classes 進行樣式設計：

```tsx
<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    錄音
  </button>
</div>
```

### CSS Modules

全局樣式定義在 `App.css`：

```css
.app {
  min-height: 100vh;
  background: var(--bg-primary);
}

.recording-btn {
  transition: all 0.2s ease;
}
```

---

## Type Definitions

主要 TypeScript 介面：

```typescript
// 錄音設備
interface AudioDevice {
  name: string;
  is_default: boolean;
}

// 錄音狀態
interface RecordingStatus {
  is_recording: boolean;
  recording_id: string | null;
}

// 應用配置
interface AppConfig {
  chatgpt_token: string;
  oai_client_build_number: string;
  oai_client_version: string;
  oai_device_id: string;
  hotkey: string;
  recording_format: string;
  audio_device: string | null;
}

// 轉錄歷史
interface TranscriptionHistory {
  id: string;
  text: string;
  duration: number;
  timestamp: number;
}
```

---

## Related Documentation

- [Backend Codemap](./backend.md) - Backend architecture details
- [INDEX.md](./INDEX.md) - Overall project architecture
