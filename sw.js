// sw.js — DragonPace Service Worker
// ⚠️  BUILD: 202604150325
// 每次部署時這個時間戳會改變 → 瀏覽器偵測到 sw.js 內容變化 → 自動更新

const CACHE_NAME = 'dragonpace-202604151126';
const STATIC_ASSETS = [
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// ── Install ──────────────────────────────────────────────
self.addEventListener('install', event => {
  // skipWaiting：新版 SW 立即接管，不等舊頁面關閉
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(() => {}))
      )
    )
  );
});

// ── Activate: 清除所有舊快取 ────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] 清除舊快取:', k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim())  // 立即控制所有分頁
  );
});

// ── Fetch ────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Google Fonts → network only（不快取，避免版本問題）
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) {
    event.respondWith(fetch(event.request).catch(() => new Response('', {status: 503})));
    return;
  }

  // index.html → network first（確保永遠拿到最新版）
  // 離線時才用快取
  if (url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
    event.respondWith(networkFirstThenCache(event.request));
    return;
  }

  // 靜態資源（icons, manifest）→ cache first
  event.respondWith(cacheFirst(event.request));
});

// ── Strategies ───────────────────────────────────────────

async function networkFirstThenCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response('<h2>離線中</h2>', {
      headers: {'Content-Type': 'text/html; charset=utf-8'}
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', {status: 503});
  }
}
