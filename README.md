<div align="center">

# GPT-Typeless

**一鍵錄音，即時轉錄** — 將您的語音快速轉換為文字

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/cablate/GPT-Typeless/release.yml)](https://github.com/cablate/GPT-Typeless/actions)
[![Release](https://img.shields.io/github/v/release/cablate/GPT-Typeless)](https://github.com/cablate/GPT-Typeless/releases)

[功能](#-功能) · [快速開始](#-快速開始) · [安裝](#-安裝) · [配置](#-配置) · [開發](#-開發)

</div>

<div align="center">

<p align="center">
  <video src="public/demo.mp4" width="600" autoplay loop muted playsinline></video>
</p>

</div>

---

## 功能

| 錄音即轉 | 快捷鍵啟動 | 隱私優先 | 歷史記錄 |
|:--------:|:--------:|:--------:|:--------:|
| 一鍵錄音，ChatGPT 轉錄 | 全域快捷鍵隨時啟動 | 音檔本地存儲，7天自動清理 | 自動保存最近5筆轉錄記錄 |

### 核心亮點

- **極速工作流** — 長按錄音 → 鬆開自動轉錄 → 複製到剪貼板，秒級完成
- **全域快捷鍵** — 按下快捷鍵開始錄音，鬆開即停止並轉錄
- **隱私保護** — 音檔本地存儲，支援自動清理舊錄音
- **專業 UI** — 簡潔設計，緊湊視窗完美適配
- **轉錄歷史** — 自動記錄最近5筆轉錄結果，方便重複使用

---

## 快速開始

1. **下載** — 從 [Releases](https://github.com/cablate/GPT-Typeless/releases) 下載最新版本
2. **配置 Token** — 在設定中輸入您的 ChatGPT Token
3. **開始錄音** — 按住 `Ctrl+Shift+R` 開始錄音，鬆開即轉錄

---

## 安裝

### 下載安裝

從 [Releases](https://github.com/cablate/GPT-Typeless/releases) 下載最新版本：

**GPT-Typeless-x.x.x_x64-setup.exe** — 執行安裝程式即可

### 從源碼構建

**前置要求：**

- Node.js 18+
- Rust 1.70+
- Windows 10+ (目前僅支援 Windows)

**構建步驟：**

```bash
# 複製專案
git clone https://github.com/cablate/GPT-Typeless.git
cd GPT-Typeless

# 安裝依賴
npm install

# 開發模式
npm run tauri dev

# 構建發布版本
npm run tauri build
```

構建完成後，安裝程式位於 `src-tauri/target/release/bundle/` 目錄。

---

## 配置

### ChatGPT Token

1. 訪問 [chatgpt.com](https://chatgpt.com)
2. 開啟瀏覽器開發者工具 → Network
3. 找到任一 `/backend-api/` 開頭的請求
4. 複製請求 Header 中的 `Authorization` 值（Bearer 後的 JWT Token）
5. 在 GPTService 設定中貼上 Token

### 額外 API 參數（選填）

為提高轉錄成功率，您可以填入以下參數：

- **oai-client-build-number** — 在 Network 請求 Header 中找到
- **oai-client-version** — 在 Network 請求 Header 中找到
- **oai-device-id** — 在 Network 請求 Header 中找到

### 快捷鍵

預設：`Ctrl+Shift+R`（長按模式）

- 按下快捷鍵：開始錄音
- 鬆開快捷鍵：停止錄音並開始轉錄

在設定中可以自定義您的快捷鍵組合。

### 錄音設備

支援多錄音設備，在設定中選擇您要使用的麥克風。

---

## 專案結構

```
gptservice-tauri/
├── src/                    # React 前端
│   ├── components/         # UI 元件
│   │   ├── features/      # 功能元件
│   │   ├── layout/        # 版面元件
│   │   └── ui/            # 通用 UI 元件
│   ├── hooks/             # React Hooks
│   ├── design-tokens/     # 設計系統
│   └── App.tsx            # 主應用
├── src-tauri/             # Tauri 後端 (Rust)
│   ├── src/
│   │   ├── lib.rs        # 核心邏輯
│   │   ├── audio.rs      # 錄音功能
│   │   ├── api.rs        # ChatGPT API
│   │   ├── hotkey.rs     # 全域快捷鍵
│   │   └── main.rs       # 進入點
│   ├── icons/            # 應用圖示
│   └── Cargo.toml        # Rust 依賴
├── package.json           # Node.js 依賴
└── tauri.conf.json       # Tauri 配置
```

---

## 技術棧

**前端：**
- React 19.1.0
- TypeScript 5.8.3
- Vite 7.0.4
- Tailwind CSS 3.4.19
- Lucide React (圖示)

**後端：**
- Rust 2021 Edition
- Tauri 2.x
- cpal (音訊錄製)
- reqwest (HTTP 請求)
- global-hotkey (全域快捷鍵)
- arboard (剪貼簿)

---

## 開發

### 開發環境設置

```bash
# 安裝依賴
npm install

# 啟動開發模式
npm run tauri dev
```

### 可用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動 Vite 開發伺服器 |
| `npm run build` | 構建前端 |
| `npm run tauri dev` | 啟動 Tauri 開發模式 |
| `npm run tauri build` | 構建發布版本 |

### 代碼規範

- 前端使用函數元件 + Hooks
- Props 類型使用 interface 定義
- Rust 錯誤處理使用 `Result<T, String>`
- 提交訊息遵循 conventional commits

---

## 文檔

| 文檔 | 說明 |
|:-----|:-----|
| [CONTRIBUTING.md](CONTRIBUTING.md) | 貢獻指南 |
| [CHANGELOG.md](CHANGELOG.md) | 版本更新日誌 |
| [LICENSE](LICENSE) | MIT 授權條款 |

---

## 授權

MIT License - 詳見 [LICENSE](LICENSE) 文件

---

## 常見問題

**Q: 轉錄失敗怎麼辦？**
A: 請檢查 Token 是否正確，也可嘗試填寫額外的 API 參數（build-number、version、device-id）。

**Q: 快捷鍵無法使用？**
A: 請確認沒有其他應用佔用相同快捷鍵，或嘗試在設定中更換快捷鍵組合。

**Q: 錄音檔案存放在哪裡？**
A: 音檔存儲在應用程式目錄下，可使用設定中的「清理7天前的錄音」功能自動清理。

---

<div align="center">

**Built with** [Tauri](https://tauri.app/) + [React](https://react.dev/)

感謝使用 GPT-Typeless！

</div>
