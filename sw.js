/* TeIP service worker — v7
 *
 * Estratégia:
 *  - navegação: network-first com fallback ao index.html em cache;
 *  - assets do mesmo domínio: stale-while-revalidate;
 *  - /epg/: network-first (o guia é atualizado semanalmente);
 *  - streams de vídeo: nunca passam pelo service worker;
 *  - recursos externos: deixados ao browser (evita cache opaca gigante).
 */

const CACHE_NAME = 'teip-v7-lusofonia';
const CORE_ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of CORE_ASSETS) {
        try {
          await cache.add(asset);
        } catch (error) {
          console.debug('[SW] asset opcional ignorado:', asset);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isStreamRequest(url) {
  return (
    /\.(m3u8|ts|m4s|mp4|mpd|mp3|aac|vtt)(\?|$)/i.test(url.pathname) ||
    url.hostname.includes('youtube.com') ||
    url.hostname.includes('googlevideo.com') ||
    url.hostname.includes('ytimg.com')
  );
}

async function networkFirst(request, fallbackToIndex = false) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackToIndex) {
      const index = (await cache.match('/index.html')) || (await cache.match('/'));
      if (index) return index;
    }
    return new Response('Offline', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone()).catch(() => {});
      return response;
    })
    .catch(() => null);

  return cached || (await network) || new Response('Offline', { status: 503 });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!['http:', 'https:'].includes(url.protocol)) return;
  if (isStreamRequest(url)) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, true));
    return;
  }

  // EPG: precisa de ir à rede para refletir a atualização semanal.
  // Não guardar respostas HTML do fallback SPA no lugar do XMLTV.
  if (url.pathname.startsWith('/epg/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && /xml/i.test(response.headers.get('content-type') || '')) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone())).catch(() => {});
          }
          return response;
        })
        .catch(async () => (await caches.match(request)) || new Response('Offline', { status: 503 }))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
