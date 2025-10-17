// sw.js
const CACHE = 'jiasa-v2';
// 核心檔案：App 的骨架
const CORE = ['./', './index.html', './manifest.json'];
// 可選檔案：App 的外觀、功能和圖示
const OPTIONAL = [
  './style.css',
  './js/app.js',
  './js/ui.js',
  './js/config.js',
  './js/state.js',
  './js/analytics.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/bowl.png',
  './assets/arrow.png',
  './assets/jiasa-text.png',
  './assets/Jiasa_headerlogowordmark.png'
];

self.addEventListener('install', (e) => {
  console.log('[SW] 安裝中...');
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // 必要檔（缺一不可）
    await c.addAll(CORE);
    // 可選檔（有就快取，沒有就略過）
    for (const url of OPTIONAL) {
      try { 
        await c.add(url); 
        console.log('[SW] 快取:', url);
      } catch (err) { 
        console.warn('[SW] 無法快取:', url);
      }
    }
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('[SW] 啟動中...');
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => {
        console.log('[SW] 刪除舊快取:', k);
        return caches.delete(k);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // 不快取 API 請求
  if (e.request.url.includes('/api/')) {
    return;
  }
  
  e.respondWith(
    fetch(e.request)
      .catch(() => caches.match(e.request))
  );
});
