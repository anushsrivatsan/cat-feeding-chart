const CACHE_NAME = "feeding-chart-v2";
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

// Google API calls always go straight to the network — never cached,
// since feeding data must stay current.
//
// Everything else (the app shell: HTML/manifest/icons) is network-FIRST:
// always try to fetch the latest version first, so updates you upload
// take effect the next time the app opens with a connection. The cache
// is only a fallback for when there's no connection at all — it is not
// used to skip the network the way a cache-first strategy would.
self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (url.includes("sheets.googleapis.com") || url.includes("googleapis.com") || url.includes("accounts.google.com")) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
