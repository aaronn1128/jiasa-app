// sw.js
const CACHE = 'jiasa-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './styles.css',   // 沒這檔就刪掉
  './app.js',       // 沒這檔就刪掉
  './icon-192.png', // 依實際檔名調整
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
