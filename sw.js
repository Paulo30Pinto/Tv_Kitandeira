const CACHE_NAME = 'teip-v4-stable';

const ASSETS_TO_CACHE = [
  '/',
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/hls.js@latest',
  'https://teiptv.netlify.app/TEIP.png',
  'https://teiptv.netlify.app/assets/TEIP-X89hzE6_.JPG'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Tenta cachear cada item individualmente. 
      // Se um falhar, os outros continuam e o SW instala com sucesso.
      const cachePromises = ASSETS_TO_CACHE.map(async (url) => {
        try {
          const response = await fetch(url, { 
            mode: url.includes('netlify.app') || url.includes('cdn') ? 'no-cors' : 'cors' 
          });
          if (response.ok || response.type === 'opaque') {
            return await cache.put(url, response);
          }
        } catch (err) {
          console.warn(`[SW] Falha ao cachear durante install: ${url}`, err);
        }
      });
      return Promise.all(cachePromises);
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
  const { request } = event;
  const url = new URL(request.url);

  // Não cacheia fluxos de vídeo ou YouTube
  if (
    url.pathname.endsWith('.m3u8') || 
    url.pathname.endsWith('.ts') || 
    url.hostname.includes('youtube.com') ||
    url.hostname.includes('googlevideo.com') ||
    url.hostname.includes('ytimg.com') ||
    request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        // Apenas cacheia respostas válidas de mesma origem ou assets estáticos conhecidos
        if (
          networkResponse && 
          (networkResponse.status === 200 || networkResponse.type === 'opaque')
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback para navegação (offline)
        if (request.mode === 'navigate') {
          return caches.match('index.html') || caches.match('/');
        }
      });
    })
  );
});