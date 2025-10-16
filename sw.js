// sw.js
const CACHE = 'jiasa-v4'; // ✅ 更新快取版本以強制更新

const CORE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './style.css',
  './js/app.js', // ✅ 修正路徑
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

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    console.log('[SW] Caching core app shell');
    await cache.addAll(CORE_FILES);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => {
        if (key !== CACHE) {
          console.log('[SW] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // 忽略後端 API 請求，永遠從網路獲取
  if (e.request.url.includes('/api/')) {
    return;
  }

  e.respondWith((async () => {
    const cachedResponse = await caches.match(e.request);
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const response = await fetch(e.request);
      // 對於非核心檔案的請求，可以選擇性地快取
      // 但此處我們採用簡單的 network-first 策略，專注於快取核心檔案
      return response;
    } catch (error) {
      // 離線時，如果快取中也沒有，則無法回應
      console.log('[SW] Fetch failed; returning offline page instead.', error);
    }
  })());
});

