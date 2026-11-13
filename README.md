# 🌸 Nihongo Buddy｜我的日語學習小教室

第 9 次作業：「建立自己的 `AGENTS.md`／`CLAUDE.md`」，完成一個可公開瀏覽、可持續擴充的日語學習網站。

## 專案簡介

Nihongo Buddy 是給繁體中文使用者的 N5–N4 日語入門網站，包含文法教室、單字翻面卡片、文法小測驗、瀏覽器本機學習進度。首頁及學習功能使用 HTML、CSS、JavaScript，不需要後端或 API Key。

## 開啟方式

### GitHub Pages（正式繳交）
1. 登入 GitHub，建立 Public repository，建議命名 `nihongo-buddy`。
2. 將專案內全部檔案、`data/` 資料夾一併上傳到倉庫根目錄（不要只上傳 ZIP）。
3. 進入 Repository **Settings → Pages → Build and deployment → Deploy from a branch**。
4. 選擇 `main` 分支、`/(root)` 資料夾並儲存。
5. 部署成功後，網址通常為 `https://你的帳號.github.io/nihongo-buddy/`。以 Pages 頁面實際顯示的網址為準。
6. 打開網站，測試文法、單字卡、測驗、進度功能。

### 本機預覽

於本專案資料夾執行：

```bash
python -m http.server 8000
```

瀏覽 `http://localhost:8000/`。教材使用 `fetch()`，直接雙擊 `index.html`（`file://`）可能導致資料無法載入。

## 作業要繳交的項目

- 專案簡介：Nihongo Buddy N5–N4 日語學習網站。
- GitHub Repository：貼上自己上傳後取得的公開倉庫網址。
- 網頁連結：貼上自己部署成功的 GitHub Pages 網址。
- `AGENTS.md`：本專案根目錄的 AI 工作規則文件。
- 規則延伸說明：透過固定資料格式及修改/測試步驟，讓 AI 日後只需要讀 `AGENTS.md`，就能依現有設計新增文法、單字、測驗而維持介面及功能一致。

## 建議示範：驗證規則可重複使用

先截圖目前的文法教室，然後請 AI：

> 請先閱讀 `AGENTS.md`，依照現有網站的結構和資料格式，新增一個 N4 文法單元「～ながら」，加入兩個日文例句與繁體中文翻譯，並加入三題測驗。保留舊功能與網站視覺風格；完成後列出修改與測試結果。

截圖新增後的文法卡與測驗，展示 `AGENTS.md` 確實有幫助 AI 遵循同一套規則擴充網站。

## 專案結構

```text
Nihongo-Buddy/
├── AGENTS.md
├── README.md
├── index.html
├── style.css
├── script.js
└── data/
    ├── grammar.json
    ├── vocabulary.json
    └── questions.json
```

## 限制

- 這是作業展示用的靜態教材及固定題庫，不是即時生成 AI 對話網站。
- 學習進度儲存於目前瀏覽器 localStorage，不跨裝置同步。
- 目前僅收錄少量示範教材，可依 `AGENTS.md` 持續擴充。
