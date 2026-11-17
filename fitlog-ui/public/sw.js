/* FitLog service worker: offline app shell.
 * - Navigations: network first, fall back to the cached app shell (SPA routes work offline).
 * - Hashed build assets (/assets/*): cache first (they never change).
 * - Google Fonts: stale-while-revalidate.
 * - API calls are never cached (they carry per-user data and auth).
 */
// Registered as /sw.js?v=<build>, so every deploy gets its own cache and the old one is deleted on activate
const VERSION = 'fitlog-' + (new URL(self.location.href).searchParams.get('v') || 'v1');
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html')),
    );
    return;
  }

  if (url.origin === self.location.origin && (url.pathname.startsWith('/assets/') || SHELL.includes(url.pathname))) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(VERSION).then((c) => c.put(request, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(VERSION).then((cache) =>
        cache.match(request).then((hit) => {
          const network = fetch(request)
            .then((res) => {
              if (res.ok || res.type === 'opaque') cache.put(request, res.clone());
              return res;
            })
            .catch(() => hit);
          return hit || network;
        }),
      ),
    );
  }
});
