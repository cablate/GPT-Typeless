# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-01-22

### Added
- 完整的語音轉錄功能
- 長按錄音模式（按下開始，鬆開停止）
- ChatGPT API 轉錄整合
- 全域快捷鍵支援（預設 Ctrl+Shift+R）
- 錄音設備選擇功能
- 轉錄歷史記錄（最近5筆）
- 音檔自動清理功能（7天）
- 轉錄結果自動複製到剪貼簿
- Modal 設定面板
- 專業 UI 設計（使用 Tailwind CSS）
- 響應式設計支援
- 系統托盤圖示
- 流程步驟視覺化（錄音 → 保存 → 轉錄 → 完成）

### Changed
- 全面升級為專業設計風格
- 使用 Lucide React 圖示
- 使用 Inter 字體

### Technical
- 前端：React 19.1.0, TypeScript 5.8.3, Vite 7.0.4
- 後端：Rust 2021, Tauri 2.x
- 主要依賴：cpal, reqwest, global-hotkey, arboard

---

[1.0.0]: https://github.com/cablate/GPT-Typeless/releases/tag/v1.0.0
