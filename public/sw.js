const CACHE = 'habit-planner-v2';
const CORE = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

function sameOriginAsset(url) {
  try {
    const parsed = new URL(url, self.location.origin);
    if (parsed.origin !== self.location.origin) return null;
    if (!/\.(?:js|css|webmanifest|png|jpg|jpeg|svg|ico|woff2?)$/i.test(parsed.pathname)) return null;
    return parsed.pathname + parsed.search;
  } catch {
    return null;
  }
}

async function precacheAppShell() {
  const cache = await caches.open(CACHE);
  const response = await fetch('/', { cache: 'no-store' });
  if (!response.ok) throw new Error('APP_SHELL_FETCH_FAILED');

  await cache.put('/', response.clone());
  const html = await response.text();
  const discovered = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)]
    .map((match) => sameOriginAsset(match[1]))
    .filter(Boolean);
  await cache.addAll([...new Set([...CORE.slice(1), ...discovered])]);
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheAppShell());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) caches.open(CACHE).then((cache) => cache.put('/', response.clone()));
          return response;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
        return response;
      });
    })
  );
});
