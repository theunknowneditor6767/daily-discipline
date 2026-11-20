// Offline-first service worker: network for navigations (fresh app), cache fallback offline.
// PRECACHE and VERSION are injected at build time (vite.config.ts).
const PRECACHE = self.__PRECACHE__ || [];
const CACHE = `dd-${self.__VERSION__ || 'dev'}`;
// App shell URL = this worker's folder, so the app works under any base path (e.g. /daily-discipline/).
const SHELL = new URL('./', self.location).href;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([SHELL, 'manifest.webmanifest', ...PRECACHE])));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // Navigations (including ?event=… links) always resolve to the app shell.
    e.respondWith(
      fetch(req)
        .then((res) => {
          caches.open(CACHE).then((c) => c.put(SHELL, res.clone()));
          return res;
        })
        .catch(() => caches.match(SHELL)),
    );
    return;
  }
  e.respondWith(
    // ignoreVary: module scripts carry an Origin header the precached copies lack.
    caches.match(req, { ignoreVary: true }).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        }),
    ),
  );
});
