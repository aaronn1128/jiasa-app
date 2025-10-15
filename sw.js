// sw.js
const CACHE = 'jiasa-v2';
// 核心檔案：App 的骨架
const CORE = ['./', './index.html', './manifest.json'];
// 可選檔案：App 的外觀、功能和圖示
const OPTIONAL = [
  './style.css',     // ✅ 已修正檔名
  './app.js',
  './assets/icon-192.png', // ✅ 已修正路徑
  './assets/icon-512.png'  // ✅ 已修正路徑
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // 必要檔（缺一不可）
    await c.addAll(CORE);
    // 可選檔（有就快取，沒有就略過）
    for (const url of OPTIONAL) {
      try { await c.add(url); } catch (_) { /* 忽略 404 */ }
    }
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});