/* Minimal shell caching for local dev.
   NOTE: `python -m http.server` does not set all PWA-friendly headers; this is still
   useful for quick offline reloads in modern browsers.
*/

const CACHE_NAME = "autoappdev-shell-v24";
const PRECACHE_URLS = [
  "./index.html",
  "./styles.css",
  "./api-client.js",
  "./i18n.js",
  "./app.js",
  "./favicon.svg",
  "./autonovelwriter-icon.svg",
  "./autonovelwriter-icon-192.png",
  "./autonovelwriter-icon-512.png",
  "./manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin requests.
  if (url.origin !== self.location.origin) return;

  // For navigations, serve cached shell when offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html", { ignoreSearch: true }))
    );
    return;
  }

  // Network-first for known shell assets so normal refreshes pick up active UI edits.
  const isPrecached = PRECACHE_URLS.some((p) => url.pathname.endsWith(p.replace("./", "")));
  if (isPrecached) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true }))
    );
    return;
  }

  // Default: network.
});
