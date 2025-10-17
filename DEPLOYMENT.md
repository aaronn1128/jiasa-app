# Jiasa 部署指南

## 🚀 部署到 Vercel

### 1. 前置準備

#### 取得 Google Places API Key
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用以下 API：
   - Places API (New)
   - Maps JavaScript API
4. 建立憑證 → API 金鑰
5. **重要**：設定 API 金鑰限制
   - 應用程式限制：HTTP 參照位址
   - 新增你的網域：`https://yourdomain.vercel.app/*`
   - API 限制：只選擇 Places API (New) 和 Maps JavaScript API

#### 設定計費
- Google Places API 需要啟用計費帳戶
- 每月有 $200 美元免費額度
- 建議設定預算警報

### 2. 部署步驟

#### 方法一：透過 Vercel Dashboard（推薦）

1. 登入 [Vercel](https://vercel.com)
2. 點擊「Import Project」
3. 從 GitHub 匯入你的 repository
4. 設定環境變數：
   ```
   GOOGLE_PLACES_API_KEY=你的API金鑰
   NODE_ENV=production
   ```
5. 點擊「Deploy」

#### 方法二：透過 Vercel CLI

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入
vercel login

# 部署
vercel

# 設定環境變數
vercel env add GOOGLE_PLACES_API_KEY
# 輸入你的 API 金鑰

# 部署到生產環境
vercel --prod
```

### 3. 環境變數設定

在 Vercel Dashboard 的專案設定中新增：

| 變數名稱 | 值 | 環境 |
|---------|-----|------|
| `GOOGLE_PLACES_API_KEY` | 你的 API 金鑰 | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

### 4. 自訂域名設定

1. 在 Vercel Dashboard → Settings → Domains
2. 新增你的自訂域名
3. 在域名服務商設定 DNS：
   ```
   Type: CNAME
   Name: @ (或 www)
   Value: cname.vercel-dns.com
   ```
4. 更新 `api/search.js` 和 `api/maps-config.js` 中的 `allowedOrigins`

### 5. 更新允許的域名

編輯以下檔案，將 `yourdomain.vercel.app` 替換為你的實際域名：

**api/search.js**
```javascript
const allowedOrigins = [
  'https://jiasa.vercel.app',  // ← 改成你的域名
  'http://localhost:3000'
];
```

**api/maps-config.js**
```javascript
const allowedOrigins = [
  'https://jiasa.vercel.app',  // ← 改成你的域名
  'http://localhost:3000'
];
```

**api/photo.js** - 無需修改

### 6. 驗證部署

部署完成後，檢查：

1. ✅ 應用程式可以正常載入
2. ✅ 可以取得使用者位置
3. ✅ 可以搜尋附近餐廳
4. ✅ 餐廳照片可以正常顯示
5. ✅ Service Worker 正常運作（離線功能）
6. ✅ 檢查 Console 沒有錯誤訊息

### 7. 常見問題排除

#### API 請求失敗
```
錯誤: API 請求失敗 (403)
```
**解決方法**：
- 檢查 Vercel 環境變數是否正確設定
- 確認 Google API 金鑰限制設定正確
- 確認已啟用 Places API (New)

#### CORS 錯誤
```
錯誤: Access to fetch has been blocked by CORS policy
```
**解決方法**：
- 確認 `allowedOrigins` 包含你的域名
- 重新部署應用程式

#### 照片無法顯示
```
錯誤: Failed to fetch photo
```
**解決方法**：
- 檢查 `/api/photo` endpoint 是否正常運作
- 確認 API 金鑰有權限存取 Places Photos

#### Service Worker 無法註冊
```
錯誤: ServiceWorker registration failed
```
**解決方法**：
- 確認使用 HTTPS（Vercel 預設提供）
- 更新 `sw.js` 中的 `CACHE` 版本號

### 8. 效能優化建議

#### 啟用 Vercel Analytics
```bash
# 安裝
npm install @vercel/analytics

# 在 index.html 最底部加入
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

#### 設定 Edge Functions（可選）
將 API 部署到更接近使用者的 Edge 節點：

```javascript
// api/search.js 開頭加入
export const config = {
  runtime: 'edge',
};
```

**注意**：Edge Functions 有一些限制，建議先在 Preview 環境測試。

### 9. 監控與維護

#### 設定 Uptime Monitoring
使用服務如：
- [UptimeRobot](https://uptimerobot.com/)
- [Pingdom](https://www.pingdom.com/)
- Vercel 內建監控

#### 查看 Logs
```bash
# 查看即時 logs
vercel logs

# 或在 Vercel Dashboard → Deployments → 選擇部署 → Runtime Logs
```

#### Google API 配額監控
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Dashboard
3. 監控每日請求量
4. 設定預算警報（建議設定在 $10-20）

### 10. 安全性檢查清單

- ✅ API Key 不在前端代碼中
- ✅ CORS 正確配置
- ✅ Google API Key 已設定限制
- ✅ 已啟用 HTTPS
- ✅ CSP headers 已設定（在 vercel.json）
- ✅ Rate limiting 已考慮（可選）

## 📱 更新 PWA

當你更新代碼後：

1. 更新 `sw.js` 中的版本號：
   ```javascript
   const CACHE = 'jiasa-v5'; // 增加版本號
   ```

2. 用戶下次訪問時會自動更新

3. 可以加入「有新版本」提示：
   ```javascript
   // 在 app.js 中
   navigator.serviceWorker.addEventListener('controllerchange', () => {
     if (confirm('有新版本可用，是否重新載入？')) {
       window.location.reload();
     }
   });
   ```

## 🔄 CI/CD 設定（可選）

Vercel 預設會自動部署 `main` 分支的每次 commit，無需額外設定。

如果想要更細緻的控制：

**.github/workflows/deploy.yml**
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
```

## 📊 建議的下一步

1. 設定 Google Analytics 或其他分析工具
2. 加入錯誤追蹤（如 Sentry）
3. 實作 Rate Limiting
4. 加入使用者回饋機制
5. 定期備份使用者資料（LocalStorage）

---

如有問題，請查看 [Vercel 文件](https://vercel.com/docs) 或提交 Issue。