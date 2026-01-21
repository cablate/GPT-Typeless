# 貢獻指南

感謝您對 GPTService 的貢獻感興趣！

## 開發環境設置

### 前置要求

- **Node.js** 18+
- **Rust** 1.70+
- **pnpm** / npm / yarn

### 安裝依賴

```bash
git clone https://github.com/user/gptservice-tauri.git
cd gptservice-tauri
npm install
```

### 開發模式

```bash
npm run tauri dev
```

---

## 專案結構

```
gptservice-tauri/
├── src/                    # React 前端
│   ├── components/         # UI 元件
│   ├── App.tsx            # 主應用
│   └── App.css            # 樣式
├── src-tauri/             # Tauri 後端
│   ├── src/
│   │   ├── lib.rs        # 錄音功能
│   │   ├── api.rs        # ChatGPT API
│   │   └── main.rs       # Tauri 主程式
│   └── Cargo.toml         # Rust 依賴
└── package.json
```

---

## 開發規範

### 前端 (React + TypeScript)

- 使用函數元件 + Hooks
- Props 類型定義使用 interface
- 樣式使用 CSS Modules 或內聯 className

### 後端 (Rust)

- 錯誤處理使用 `Result<T, String>`
- 函數命名使用 snake_case
- 添加適當的註釋說明

### 提交規範

```
type(scope): description

# 範例
feat(recording): 新增錄音暫停功能
fix(api): 修復 token 過期問題
docs(readme): 更新安裝說明
```

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

## 提交 PR

1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

### PR 檢查清單

- [ ] 代碼通過 `npm run build` 編譯
- [ ] 遵循代碼規範
- [ ] 添加適當的測試
- [ ] 更新相關文檔

---

## 行為準則

- 尊重所有貢獻者
- 建設性討論技術問題
- 歡迎新手提問

感謝您的貢獻！
