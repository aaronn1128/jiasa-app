// sw.js (改進版)
const CACHE = 'jiasa-v5'; // ✅ 更新版本號

const CORE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './style.css',
  './js/app.js',
  './js/config.js',
  './js/state.js',
  './js/ui.js',
  './js/analytics.js',
  './assets/bowl.png',
  './assets/arrow.png',
  './assets/jiasa-text.png',
  './assets/Jiasa_headerlogowordmark.png',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

// ========== Install 事件 ==========
self.addEventListener('install', (e) => {
  console.log('[SW] Installing service worker...');
  e.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      console.log('[SW] Caching core app shell');
      await cache.addAll(CORE_FILES);
      console.log('[SW] Core files cached successfully');
    } catch (error) {
      console.error('[SW] Failed to cache core files:', error);
      // 即使快取失敗，也讓 SW 安裝完成
    }
  })());
  self.skipWaiting();
});

// ========== Activate 事件 ==========
self.addEventListener('activate', (e) => {
  console.log('[SW] Activating service worker...');
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // 立即控制所有頁面
  self.clients.claim();
});

// ========== Fetch 事件 ==========
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // 忽略非 GET 請求
  if (request.method !== 'GET') {
    return;
  }

  // 忽略後端 API 請求（永遠從網路獲取）
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(request).catch(error => {
        console.error('[SW] API fetch failed:', error);
        return new Response(
          JSON.stringify({ error: 'Network unavailable' }), 
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // 忽略外部資源（例如 Google Maps API）
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // ========== Cache First 策略（適用於核心檔案）==========
  e.respondWith((async () => {
    try {
      // 先檢查快取
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('[SW] Serving from cache:', url.pathname);
        return cachedResponse;
      }

      // 快取中沒有，從網路獲取
      console.log('[SW] Fetching from network:', url.pathname);
      const networkResponse = await fetch(request);

      // 只快取成功的 GET 請求
      if (networkResponse && networkResponse.status === 200) {
        const cache = await caches.open(CACHE);
        // 複製 response（因為 response 只能使用一次）
        cache.put(request, networkResponse.clone());
      }

      return networkResponse;
    } catch (error) {
      console.error('[SW] Fetch failed:', error);

      // 如果是 HTML 請求，返回快取的 index.html（離線頁面）
      if (request.headers.get('accept').includes('text/html')) {
        const cachedIndex = await caches.match('./index.html');
        if (cachedIndex) {
          return cachedIndex;
        }
      }

      // 返回簡單的離線提示
      return new Response('Offline - Please check your connection', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  })());
});

// ========== Message 事件（用於手動更新）==========
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skipping waiting...');
    self.skipWaiting();
  }
  
  if (e.data && e.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing all caches...');
    e.waitUntil(
      caches.keys().then(keys => {
        return Promise.all(keys.map(key => caches.delete(key)));
      })
    );
  }
});
