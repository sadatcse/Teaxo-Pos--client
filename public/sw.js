const CACHE_NAME = 'teaxo-pos-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/manifest.json'
];

// Install Event: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache and caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event: Cleanup older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Caching proxy using Stale-While-Revalidate pattern
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Exclude API requests and WebSockets from service worker cache
  if (
    url.pathname.includes('/user/') ||
    url.pathname.includes('/category/') ||
    url.pathname.includes('/product/') ||
    url.pathname.includes('/company/') ||
    url.pathname.includes('/permissions/') ||
    url.pathname.includes('/role-permissions/') ||
    url.pathname.includes('/addons/') ||
    url.pathname.includes('/invoice/') ||
    request.url.includes('socket.io')
  ) {
    return;
  }

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response, but update cache in the background
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {
            // Silently fail if offline or fetch fails
          });
        return cachedResponse;
      }

      // If not in cache, fetch from network and store in cache
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      }).catch((err) => {
        // If offline and request is for a route page, fallback to index.html
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return Promise.reject(err);
      });
    })
  );
});
