const CACHE_NAME = 'dragonpace-v4';

// 1. 核心靜態資源清單 (App 安裝時強制下載)
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/splash.png'
];

// ══════════════════════════════════════════════
// 安裝階段 (Install) : 預先下載並快取核心資源
// ══════════════════════════════════════════════
self.addEventListener('install', e => {
  self.skipWaiting(); // 強制立即接管控制權，不用等舊版 SW 關閉
  
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] 預先快取核心資源中...');
      // 即使部分圖檔遺失，也不要中斷整個安裝過程
      return Promise.allSettled(
        CORE_ASSETS.map(url => cache.add(url).catch(err => console.warn(`[SW] 找不到資源: ${url}`)))
      );
    })
  );
});

// ══════════════════════════════════════════════
// 啟動階段 (Activate) : 清理舊版本的快取，釋放使用者手機空間
// ══════════════════════════════════════════════
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] 刪除舊版快取:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // 立即讓所有開啟的網頁套用最新的 Service Worker
});

// ══════════════════════════════════════════════
// 攔截請求階段 (Fetch) : Cache First + 動態快取策略
// ══════════════════════════════════════════════
self.addEventListener('fetch', e => {
  // 只處理 GET 請求，略過 POST (例如 API) 與瀏覽器擴充功能請求
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      // 策略 1：如果快取裡有，直接秒回傳快取 (極速、完全支援離線)
      if (cachedResponse) {
        return cachedResponse;
      }

      // 策略 2：如果快取沒有，向網路發起請求
      return fetch(e.request).then(networkResponse => {
        // 確保取得正確的響應才進行快取
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
          return networkResponse;
        }

        // 動態快取：複製一份新取得的資源存入快取中 (例如 Google Fonts)
        // 注意：Response stream 只能被讀取一次，所以必須 clone()
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, responseToCache);
        });

        return networkResponse;
      }).catch(err => {
        // 當網路斷線，且快取也沒有命中時的終極 Fallback
        console.warn('[SW] 網路連線失敗，且無快取可用:', e.request.url);
        // 如果未來有製作專門的 offline.html，可以從這裡回傳
      });
    })
  );
});
