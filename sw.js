const CACHE_NAME = 'teip-stream-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://teiptv.netlify.app/TEIP.png',
  'https://teiptv.netlify.app/assets/TEIP-X89hzE6_.JPG',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/hls.js@latest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (
    event.request.url.includes('.m3u8') || 
    event.request.url.includes('.ts') || 
    event.request.url.includes('youtube.com') ||
    event.request.url.includes('googlevideo.com')
  ) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          if (event.request.mode === 'navigate') {
            return cache.match('/index.html');
          }
        });
        return cachedResponse || fetchPromise;
      });
    })
  );
});