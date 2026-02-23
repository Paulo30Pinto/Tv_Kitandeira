const CACHE_NAME = 'teip-v5-robust';

// Arquivos críticos locais que devem ser cacheados
const CORE_ASSETS = [
  '/',
  'index.html',
  'manifest.json'
];

// Assets externos que podem falhar ou ter problemas de CORS
const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/hls.js@latest',
  'https://teiptv.netlify.app/TEIP.png',
  'https://teiptv.netlify.app/assets/TEIP-X89hzE6_.JPG'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Tenta adicionar os arquivos core (locais)
      try {
        await cache.addAll(CORE_ASSETS);
      } catch (e) {
        console.warn('[SW] Falha em alguns arquivos core:', e);
      }

      // 2. Tenta adicionar os arquivos externos um por um
      const externalPromises = EXTERNAL_ASSETS.map(async (url) => {
        try {
          const response = await fetch(url, { 
            mode: 'no-cors', // Garante que assets externos não causem erro de instalação
            cache: 'no-cache'
          });
          return await cache.put(url, response);
        } catch (err) {
          console.warn(`[SW] Pulando asset externo com erro: ${url}`);
        }
      });
      
      return Promise.all(externalPromises);
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

  // Ignorar métodos que não sejam GET e fluxos de vídeo/YouTube
  if (
    request.method !== 'GET' ||
    url.pathname.endsWith('.m3u8') || 
    url.pathname.endsWith('.ts') || 
    url.hostname.includes('youtube.com') ||
    url.hostname.includes('googlevideo.com') ||
    url.hostname.includes('ytimg.com')
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        // Cacheia se a resposta for válida ou opaca (CORS externo)
        if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback offline para navegação principal
        if (request.mode === 'navigate') {
          return caches.match('index.html') || caches.match('/');
        }
      });
    })
  );
});