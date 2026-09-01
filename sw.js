const CACHE_NAME = "feeding-chart-v1";
const APP_SHELL = [
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// App shell (HTML/manifest/icons) is cached so the app still opens offline.
// Live data calls to Google Sheets always go to the network — never cached,
// since feeding data must stay current.
self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (url.includes("sheets.googleapis.com") || url.includes("googleapis.com") || url.includes("accounts.google.com")) {
    return; // let these go straight to the network
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
