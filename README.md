<div align="center">

# GPT-Typeless

**一鍵錄音，即時轉錄** — 將您的語音快速轉換為文字

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/user/gptservice-tauri/build.yml)](https://github.com/user/gptservice-tauri/actions)
[![Release](https://img.shields.io/github/v/release/user/gptservice-tauri)](https://github.com/user/gptservice-tauri/releases)

[功能](#-功能) · [快速開始](#-快速開始) · [安裝](#-安裝) · [配置](#-配置)

</div>

---

## 🎸 功能

| 錄音即轉 | 快捷鍵啟動 | 隱私優先 |
|:--------:|:--------:|:--------:|
| 一鍵錄音，ChatGPT 轉錄 | 全域快捷鍵隨時啟動 | 音檔本地存儲，7天自動清理 |

### 核心亮點

- **🚀 極速工作流** — 錄音 → 停止 → 自動複製到剪貼板，3 秒完成
- **⌨️ 全域快捷鍵** — 在任何應用中快速啟動錄音
- **🔒 隱私保護** — 音檔本地存儲，支持自動清理舊錄音
- **💎 專業 UI** — 簡潔設計，緊湊視窗完美適配

---

![Image](./public/demo.png)

---

<!-- ## 🚀 快速開始

1. **下載** — 從 [Releases](https://github.com/user/gptservice-tauri/releases) 下載最新版本
2. **配置 Token** — 在設定中輸入您的 ChatGPT Token
3. **開始錄音** — 按 `Ctrl+Shift+R` 或點擊開始錄音 -->

## 📦 安裝

### Windows

```bash
# 使用安裝程式（推薦）
gptservice-setup.exe

# 或使用 portable 版本
gptservice-win.exe
```

### 從源碼構建

```bash
git clone https://github.com/user/gptservice-tauri.git
cd gptservice-tauri
npm install
npm run tauri build
```

---

## ⚙️ 配置

### ChatGPT Token

1. 訪問 [chatgpt.com](https://chatgpt.com)
2. 開啟瀏覽器開發者工具 → Network
3. 複製任意一個請求中，Header - Auth 的值
4. 在 GPTService 設定中貼上 Bearer 後的值

### 快捷鍵

默認：`Ctrl+Shift+R`

在設定中自定義您的快捷鍵組合。

---

## 📖 更多資訊

| 文檔 | 說明 |
|:-----|:-----|
| [CONTRIBUTING.md](CONTRIBUTING.md) | 貢獻指南 |
| [CHANGELOG.md](CHANGELOG.md) | 版本更新日誌 |
| [LICENSE](LICENSE) | MIT 授權條款 |

---

歡迎貢獻！請查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解詳情。

---

<div align="center">

**Built with** [Tauri](https://tauri.app/) + [React](https://react.dev/)

</div>
