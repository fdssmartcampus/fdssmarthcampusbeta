'use strict';
// Only public PWA support files are cached. Campus pages, sessions, API responses,
// documents and reservations always use the network and are never stored here.
const VERSION = 'fds-pwa-20261104-2';
const CACHE_PREFIX = 'fds-campus-pwa-';
const CACHE_NAME = CACHE_PREFIX + VERSION;
const base = new URL('./', self.location.href);
const OFFLINE_URL = new URL('offline.html', base).href;
const PUBLIC_FILES = ['offline.html', 'manifest.webmanifest', 'pwa.css', 'pwa.js',
  'icons/campus-192.png', 'icons/campus-512.png', 'icons/campus-maskable-512.png', 'icons/campus-180.png'];
const ALLOWED = new Set(PUBLIC_FILES.map(path => new URL(path, base).href));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(
    [...ALLOWED].map(url => new Request(url, {cache: 'reload'}))
  )));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => {
      const offline = await (await caches.open(CACHE_NAME)).match(OFFLINE_URL);
      return offline || new Response('Sin conexión. Vuelve a intentarlo cuando tengas internet.', {status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'}});
    }));
    return;
  }
  if (ALLOWED.has(url.href)) {
    event.respondWith((async () => {
      try { const response = await fetch(request); if (response.ok) return response; } catch (_) {}
      return await (await caches.open(CACHE_NAME)).match(url.href) || Response.error();
    })());
  }
});
