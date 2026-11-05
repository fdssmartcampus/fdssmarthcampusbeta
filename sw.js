'use strict';
// Only public static code and PWA support files are cached. Pages, sessions, API responses,
// documents and reservations always use the network and are never stored here.
const VERSION = 'fds-pwa-20261105-clases-laboratorios';
const CACHE_PREFIX = 'fds-campus-pwa-';
const CACHE_NAME = CACHE_PREFIX + VERSION;
const base = new URL('./', self.location.href);
const OFFLINE_URL = new URL('offline.html', base).href;
// Solo código público estático; nunca datos, sesiones ni respuestas de la API.
const STATIC_ASSETS = ['shared/campus-shared.js?v=20261105-apolo','shared/workshops.js?v=20261105-lanzamiento','shared/workshops.css?v=20261105-lanzamiento','app/assistant.js?v=20261105-calendarios', 'app/assistant.css?v=20261105-apolo', 'app/daily-core.js?v=20261105-apolo', 'assets/brand/sello-fds.svg?v=20261105-apolo', 'vendor/supabase.js', 'app/app.css?v=20261105-horario-horizontal',
  'app/mobile-layout.js?v=20261104-mobile', 'app/config.js',
  'app/core.js?v=20261105-apolo', 'app/app.js?v=20261105-clases-laboratorios'];
const CACHE_FIRST = new Set(STATIC_ASSETS.map(path => new URL(path, base).href));
const PUBLIC_FILES = [...STATIC_ASSETS,'offline.html', 'manifest.webmanifest', 'pwa.css', 'pwa.js',
  'icons/campus-192.png', 'icons/campus-512.png', 'icons/campus-maskable-512.png', 'icons/campus-180.png'];
const ALLOWED = new Set(PUBLIC_FILES.map(path => new URL(path, base).href));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(
    [...ALLOWED].map(url => new Request(url, {cache: CACHE_FIRST.has(url) ? 'default' : 'reload'}))
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
      const cache = await caches.open(CACHE_NAME);
      if (CACHE_FIRST.has(url.href)) {
        const cached = await cache.match(url.href);
        if (cached) return cached;
      }
      try {
        const response = await fetch(request);
        if (response.ok) return response;
      } catch (_) {}
      return await cache.match(url.href) || Response.error();
    })());
  }
});
