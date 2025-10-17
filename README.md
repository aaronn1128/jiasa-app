# 🍜 Jiasa - 用滑的找餐廳

一個類似 Tinder 的餐廳推薦 PWA，讓你用滑動的方式快速找到想吃的餐廳！

## ✨ 特色功能

- 🎯 **直覺滑動**：左滑略過，右滑喜歡
- 📍 **地理位置**：自動搜尋附近餐廳
- 🎨 **多主題**：Classic、Mocha、Olive、Sakura 四種主題
- 🌐 **多語言**：支援繁體中文與英文
- 💾 **離線支援**：PWA 技術，可離線使用
- 🧠 **智慧推薦**：根據你的選擇學習偏好
- ♿ **無障礙**：完整的 ARIA 標籤與鍵盤支援

## 🚀 快速開始

### 本地開發

1. **Clone 專案**
   ```bash
   git clone https://github.com/yourusername/jiasa.git
   cd jiasa
   ```

2. **設定環境變數**
   ```bash
   cp .env.example .env.local
   # 編輯 .env.local，填入你的 Google Places API Key
   ```

3. **安裝 Vercel CLI（用於本地測試 API）**
   ```bash
   npm install -g vercel
   ```

4. **啟動本地開發伺服器**
   ```bash
   # 方法一：使用 Python
   python -m http.server 3000
   
   # 方法二：使用 Node.js
   npx serve -l 3000
   
   # 方法三：使用 VS Code Live Server
   # 右鍵 index.html → Open with Live Server
   ```

5. **啟動 Vercel Dev（測試 API）**
   ```bash
   vercel dev
   ```

6. **開啟瀏覽器**
   ```
   http://localhost:3000
   ```

## 📁 專案結構

```
jiasa/
├── index.html              # 主頁面
├── manifest.json           # PWA Manifest
├── sw.js                   # Service Worker
├── style.css               # 樣式表
├── js/
│   ├── app.js             # 主應用程式邏輯
│   ├── config.js          # 配置與 i18n
│   ├── state.js           # 狀態管理
│   ├── ui.js              # UI 渲染與互動
│   └── analytics.js       # 分析追蹤
├── api/
│   ├── search.js          # 搜尋附近餐廳 API
│   ├── photo.js           # 照片代理 API
│   └── maps-config.js     # Maps SDK 配置 API
├── assets/                # 圖片資源
│   ├── bowl.png
│   ├── arrow.png
│   ├── jiasa-text.png
│   ├── Jiasa_headerlogowordmark.png
│   ├── icon-192.png
│   └── icon-512.png
├── vercel.json            # Vercel 部署配置
├── .env.example           # 環境變數範本
├── .gitignore            # Git 忽略檔案
├── README.md             # 專案說明（本檔案）
└── DEPLOYMENT.md         # 部署指南
```

## 🔧 技術棧

- **前端**：原生 JavaScript (ES6+), CSS3, HTML5
- **API**：Google Places API (New)
- **部署**：Vercel Serverless Functions
- **PWA**：Service Worker, Web App Manifest
- **狀態管理**：LocalStorage
- **UI/UX**：Pointer Events API, CSS Animations

## 🌐 API 端點

### 1. `/api/search`
搜尋附近餐廳

**參數**：
- `lat` (必填): 緯度
- `lng` (必填): 經度
- `radius` (必填): 搜尋半徑（公尺，100-5000）
- `category` (選填): 類別（restaurant, cafe_dessert, bar）
- `lang` (選填): 語言（zh, en）

**回應**：
```json
{
  "places": [
    {
      "id": "...",
      "displayName": { "text": "餐廳名稱" },
      "rating": 4.5,
      "distanceMeters": 350,
      "photos": [...],
      ...
    }
  ]
}
```

### 2. `/api/photo`
取得餐廳照片（代理請求）

**參數**：
- `photoName` (必填): 照片名稱（從 search API 取得）

**回應**：圖片二進位資料

### 3. `/api/maps-config`
取得 Google Maps SDK 配置（避免暴露 API Key）

**回應**：
```json
{
  "mapsUrl": "https://maps.googleapis.com/maps/api/js?key=..."
}
```

## 🎨 自訂主題

在 `style.css` 中修改 CSS 變數：

```css
:root {
  --bg: #1b0f0a;
  --fg: #fff6f0;
  --primary: #ff8a3d;
  --primary-2: #ff5a5f;
  /* ... 更多變數 */
}
```

## 🌍 新增語言

1. 在 `js/config.js` 的 `I18N` 物件中新增語言：

```javascript
export const I18N = {
  zh: { settings: "設定", ... },
  en: { settings: "Settings", ... },
  ja: { settings: "設定", ... }  // ← 新增日文
};
```

2. 在 `index.html` 的語言選單中新增選項

## 📱 安裝為 PWA

### iOS (Safari)
1. 開啟網站
2. 點擊「分享」按鈕
3. 選擇「加入主畫面」

### Android (Chrome)
1. 開啟網站
2. 點擊「選單」（三個點）
3. 選擇「安裝應用程式」或「加到主畫面」

## 🔐 安全性

- ✅ API Key 存放在後端環境變數
- ✅ CORS 限制只允許特定域名
- ✅ Google API Key 設定應用程式限制
- ✅ 輸入參數驗證
- ✅ CSP Headers（在 vercel.json）

## 🐛 已知問題與限制

1. **Google Places API 配額**：免費額度有限，建議設定預算警報
2. **照片快取**：首次載入可能較慢，後續會快取
3. **定位精度**：依賴裝置 GPS，室內可能不準確
4. **瀏覽器支援**：需要支援 Pointer Events 與 ES6+

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

### 開發流程
1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. Commit 變更 (`git commit -m 'Add some AmazingFeature'`)
4. Push 到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

MIT License - 詳見 LICENSE 檔案

## 🙏 致謝

- Google Places API
- Vercel Platform
- Lucide Icons（如果有使用）
- 所有貢獻者

## 📞 聯絡方式

- 作者：[你的名字]
- Email：[your.email@example.com]
- Website：[https://yourwebsite.com]

---

用 ❤️ 與 ☕ 製作