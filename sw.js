const CACHE_NAME = 'teip-stream-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/hls.js@latest'
];

// External assets that might have CORS issues
const EXTERNAL_IMAGES = [
  'https://teiptv.netlify.app/TEIP.png',
  'https://teiptv.netlify.app/assets/TEIP-X89hzE6_.JPG'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Add essential local assets
      try {
        await cache.addAll(STATIC_ASSETS);
      } catch (err) {
        console.warn('SW: Some static assets failed to cache during install', err);
      }
      
      // 2. Add external images one by one to avoid failing the whole installation
      for (const url of EXTERNAL_IMAGES) {
        try {
          const request = new Request(url, { mode: 'no-cors' });
          const response = await fetch(request);
          if (response.ok || response.type === 'opaque') {
            await cache.put(request, response);
          }
        } catch (err) {
          console.warn(`SW: Failed to cache external asset: ${url}`, err);
        }
      }
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
  const url = event.request.url;

  // Skip caching for streams and YouTube
  if (
    url.includes('.m3u8') || 
    url.includes('.ts') || 
    url.includes('youtube.com') ||
    url.includes('googlevideo.com') ||
    url.includes('ytimg.com')
  ) {
    return;
  }

  // Handle caching for other requests
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Cache valid responses
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});