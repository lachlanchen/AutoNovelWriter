/* Minimal offline shell service worker (cache static assets). */

const CACHE_NAME = 'anw-shell-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './app.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))));
      await self.clients.claim();
    })()
  );
});

function isApi(url) {
  return url.pathname.startsWith('/api/');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin.
  if (url.origin !== self.location.origin) return;

  // Let API calls go to network (no caching for now).
  if (isApi(url)) return;

  // Navigation: serve cached shell, update in background.
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match('./index.html');
        const fetchPromise = fetch(req)
          .then((res) => {
            cache.put('./index.html', res.clone());
            return res;
          })
          .catch(() => null);

        return (await fetchPromise) || cached || Response.error();
      })()
    );
    return;
  }

  // Static: cache-first.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      const res = await fetch(req);
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })()
  );
});
