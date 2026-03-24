// sw.js  — DragonPace Service Worker
// 策略：Cache First（核心資源） + Network First（外部字型）

// 🚨 這裡將版本號改為 v2，強制瀏覽器清除舊快取並抓取最新的 index.html
const CACHE_NAME = 'dragonpace-v2'; 
const CORE_ASSETS = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// ── Install: pre-cache core assets ──────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache what we can, ignore failures (icons might not exist yet)
      return Promise.allSettled(
        CORE_ASSETS.map(url =>
          cache.add(url).catch(e => console.warn(`Cache miss: ${url}`, e))
        )
      );
    }).then(() => self.skipWaiting()) // 強制立刻接管
  );
});

// ── Activate: clean old caches ───────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim()) // 強制立刻控制所有開啟的頁面
  );
});

// ── Fetch strategy ───────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Google Fonts — network first, fall back to cache
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Same-origin assets — cache first
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Everything else — network only
  event.respondWith(fetch(event.request));
});

// ── Cache strategies ─────────────────────────────────────

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
    // Offline and not in cache — return offline page if available
    return caches.match('./index.html');
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('', { status: 503 });
  }
}

// ── Background sync (future: sync sessions when back online) ─
self.addEventListener('sync', event => {
  if (event.tag === 'sync-sessions') {
    event.waitUntil(syncSessions());
  }
});

async function syncSessions() {
  // Placeholder: in production, POST cached sessions to server
  console.log('[SW] Background sync: sessions');
}

// ── Push notifications (future: coach sends cues) ─────────
self.addEventListener('push', event => {
  const data = event.data?.json() ?? { title: 'DragonPace', body: '訓練提醒' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: 'dragonpace',
      renotify: true,
    })
  );
});
