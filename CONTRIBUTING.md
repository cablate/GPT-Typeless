# 貢獻指南

感謝您對 GPT-Typeless 的貢獻感興趣！

---

## 開發環境設置

### 前置要求

- **Node.js** 18+
- **Rust** 1.70+ (2021 edition)
- **Windows 10+** (目前僅支援 Windows 平台)
- **npm** / pnpm / yarn

### 安裝依賴

```bash
git clone https://github.com/cablate/GPT-Typeless.git
cd gptservice-tauri
npm install
```

### 開發模式

```bash
npm run tauri dev
```

這會同時啟動 Vite 開發伺服器 (http://localhost:1420) 和 Tauri 應用程式。

---

## 專案結構

```
gptservice-tauri/
├── src/                        # React 前端
│   ├── components/
│   │   ├── features/          # 功能元件
│   │   │   ├── RecordingControl.tsx
│   │   │   ├── TranscriptionResult.tsx
│   │   │   ├── TimerDisplay.tsx
│   │   │   └── SettingsModal.tsx
│   │   ├── layout/            # 版面元件
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MainContent.tsx
│   │   └── ui/                # 通用 UI 元件
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Modal.tsx
│   │       └── ...
│   ├── hooks/                 # React Hooks
│   │   ├── useToast.ts
│   │   ├── useFocusTrap.ts
│   │   └── ...
│   ├── design-tokens/         # 設計系統
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── ...
│   ├── utils/                 # 工具函數
│   ├── App.tsx                # 主應用組件
│   └── main.tsx               # 進入點
├── src-tauri/                 # Tauri 後端 (Rust)
│   ├── src/
│   │   ├── lib.rs            # 核心邏輯、Tauri commands
│   │   ├── audio.rs          # 錄音功能 (cpal)
│   │   ├── api.rs            # ChatGPT API (reqwest)
│   │   ├── hotkey.rs         # 全域快捷鍵
│   │   └── main.rs           # 進入點
│   ├── icons/                # 應用圖示
│   ├── capabilities/          # Tauri 權限配置
│   ├── Cargo.toml            # Rust 依賴
│   └── tauri.conf.json       # Tauri 配置
├── public/                    # 靜態資源
├── package.json              # Node.js 依賴
├── vite.config.ts            # Vite 配置
└── tsconfig.json             # TypeScript 配置
```

---

## 開發規範

### 前端 (React + TypeScript)

- 使用函數元件 + Hooks
- Props 類型定義使用 interface
- 樣式使用 Tailwind CSS utility classes
- 圖示使用 Lucide React

**元件範例：**

```tsx
export interface MyComponentProps {
  /** 標題文字 */
  title: string;
  /** 點擊回調 */
  onClick: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => {
  return <button onClick={onClick}>{title}</button>;
};
```

### 後端 (Rust)

- 錯誤處理使用 `Result<T, String>`
- 函數命名使用 snake_case
- 添加適當的文檔註釋
- Tauri commands 使用 `#[tauri::command]` 宏

**Command 範例：**

```rust
#[tauri::command]
pub fn my_command(param: String) -> Result<String, String> {
    // 處理邏輯
    Ok(format!("處理結果: {}", param))
}
```

### 提交規範

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
type(scope): description

# 範例
feat(recording): 新增錄音暫停功能
fix(api): 修復 token 過期問題
docs(readme): 更新安裝說明
style(ui): 調整按鈕樣式
refactor(audio): 重構音訊處理邏輯
test(transcription): 新增轉錄測試
changelog: 更新版本日誌
```

---

## 可用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動 Vite 開發伺服器 |
| `npm run build` | 構建前端 |
| `npm run preview` | 預覽構建結果 |
| `npm run tauri dev` | 啟動 Tauri 開發模式 |
| `npm run tauri build` | 構建發布版本 |
| `npm run tauri info` | 顯示 Tauri 環境資訊 |

---

## 測試

```bash
# 前端測試
npm test

# Rust 測試
cd src-tauri
cargo test

# 構建驗證
npm run build
```

---

## Tauri Commands

前端可以通過 `invoke()` 調用以下後端指令：

| 指令 | 說明 |
|------|------|
| `start_recording` | 開始錄音 |
| `stop_recording` | 停止錄音 |
| `get_recording_status` | 獲取錄音狀態 |
| `list_audio_devices` | 列出錄音設備 |
| `transcribe_audio` | 轉錄音訊 |
| `copy_to_clipboard` | 複製到剪貼簿 |
| `get_config_command` | 獲取配置 |
| `set_config` | 保存配置 |
| `cleanup_old_recordings` | 清理舊錄音 |
| `health_check` | 健康檢查 |
| `get_transcription_history` | 獲取轉錄歷史 |
| `delete_history_item` | 刪除單筆歷史 |
| `clear_all_history` | 清空所有歷史 |

---

## 提交 PR

1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'feat(recording): add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

### PR 檢查清單

- [ ] 代碼通過 `npm run build` 編譯
- [ ] `npm run tauri build` 構建成功
- [ ] 遵循代碼規範
- [ ] 添加適當的測試（如需要）
- [ ] 更新相關文檔

---

## 行為準則

- 尊重所有貢獻者
- 建設性討論技術問題
- 歡迎新手提問
- 接受不同觀點和建議

感謝您的貢獻！
