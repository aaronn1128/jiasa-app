// sw.js
const CACHE = 'jiasa-v2';
const CORE = ['./', './index.html', './manifest.json'];
const OPTIONAL = ['./styles.css', './app.js', './icon-192.png', './icon-512.png'];

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
