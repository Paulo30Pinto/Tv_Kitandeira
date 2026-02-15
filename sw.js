
const CACHE_NAME = 'teip-stream-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/TEIP.png',
  '/TEIP.JPG'
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
  // Ignora streams e requisições dinâmicas de vídeo
  if (
    event.request.url.includes('.m3u8') || 
    event.request.url.includes('.ts') || 
    event.request.url.includes('youtube.com') ||
    event.request.url.includes('googlevideo.com')
  ) {
    return;
  }

  // Estratégia Stale-While-Revalidate para o restante
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Fallback para quando o fetch falha (offline total)
          if (event.request.mode === 'navigate') {
            return cache.match('/index.html');
          }
        });
        return cachedResponse || fetchPromise;
      });
    })
  );
});
