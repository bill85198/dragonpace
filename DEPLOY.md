# DragonPace PWA — 部署指南

## 📁 需要的檔案結構

```
dragonpace/
├── index.html        ← 主程式（dragon-boat-v4.html 改名）
├── manifest.json     ← PWA 設定
├── sw.js             ← Service Worker（離線快取）
└── icons/
    ├── icon-192.png  ← App 圖示（192×192 px）
    ├── icon-512.png  ← App 圖示（512×512 px）
    └── splash.png    ← 啟動畫面（1242×2688 px，選填）
```

---

## 🎨 製作 App 圖示（2 分鐘）

1. 打開 **Canva**（免費）或任何圖片編輯器
2. 建立 512×512px 黑底圖片
3. 放上龍舟圖案或文字 "DP"
4. 匯出兩份：`icon-192.png`（192×192）和 `icon-512.png`（512×512）
5. 放入 `icons/` 資料夾

> 沒有圖示也可以先部署，只是主畫面圖示會是預設樣式

---

## 🚀 方案一：GitHub Pages（推薦，免費）

### 步驟 1：建立 GitHub 帳號
前往 [github.com](https://github.com) 註冊（免費）

### 步驟 2：建立新 Repository
1. 右上角 **+** → **New repository**
2. Repository name: `dragonpace`
3. 選 **Public**
4. 點 **Create repository**

### 步驟 3：上傳檔案
**方法 A（最簡單）— 直接拖曳：**
1. 進入你的 repository
2. 點 **uploading an existing file**
3. 把 `index.html`、`manifest.json`、`sw.js`、`icons/` 資料夾全部拖進去
4. 點 **Commit changes**

**方法 B — 用 Git：**
```bash
git clone https://github.com/你的帳號/dragonpace
cp dragon-boat-v4.html dragonpace/index.html
cp manifest.json sw.js dragonpace/
cp -r icons dragonpace/
cd dragonpace
git add .
git commit -m "Deploy DragonPace PWA"
git push
```

### 步驟 4：開啟 GitHub Pages
1. Repository → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **(root)**
4. 點 **Save**
5. 等約 1 分鐘 → 得到網址：`https://你的帳號.github.io/dragonpace/`

---

## 🚀 方案二：Netlify（最快，拖放即部署）

1. 前往 [netlify.com](https://netlify.com) 免費註冊
2. 把整個 `dragonpace/` 資料夾**直接拖放**到 Netlify 控制台
3. 立刻得到網址，例如 `https://dragonpace.netlify.app`
4. 可自訂域名（選填）

---

## 📲 隊員安裝方式

### iPhone / Safari：
1. 打開網址（Safari 才能安裝，Chrome 不行）
2. 點底部**分享按鈕** 📤
3. 選「**加入主畫面**」
4. 點右上角「**新增**」
5. 桌面會出現 DragonPace 圖示，點開就是全螢幕 App

### Android / Chrome：
1. 打開網址
2. 瀏覽器右上角 **⋮** → **安裝應用程式**
3. 或頁面底部會自動彈出安裝橫幅

---

## 🔑 iPhone 感測器授權流程

第一次打開 App 後：

| 時機 | 彈出授權 |
|---|---|
| 按下「START」時 | 📍 位置存取（GPS 船速/距離） |
| 自動（iOS 13+） | 不需要授權，震動直接可用 |

---

## ✅ 功能確認清單

部署後在手機測試：
- [ ] 網址可正常開啟
- [ ] 「加入主畫面」後圖示正確
- [ ] 離線開啟（關掉 WiFi/行動數據）仍能使用
- [ ] 按 START 彈出 GPS 授權
- [ ] 節拍器有聲音
- [ ] 按拍有震動
- [ ] 螢幕在訓練中不會自動鎖定

---

## 🌐 自訂網域（選填）

若有自己的網域（如 `dragonpace.tw`）：

**GitHub Pages：**
- Repository → Settings → Pages → Custom domain → 輸入你的網域
- 在 DNS 設定加入 CNAME 指向 `你的帳號.github.io`

**Netlify：**
- Site settings → Domain management → Add custom domain

---

## ⚠️ 注意事項

1. **必須使用 HTTPS** — GitHub Pages 和 Netlify 都自動提供，本機 `file://` 無法用 GPS 和 Service Worker
2. **GPS 需要戶外** — 室內 GPS 訊號弱，速度/距離數值會不準
3. **Wake Lock（螢幕常亮）** — Safari 17+ 才完整支援，舊版 iPhone 訓練時需設定「自動鎖定 → 永不」
4. **字型離線** — 第一次需要有網路才能載入 Orbitron 字型，之後快取可離線顯示
