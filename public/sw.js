self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Do nothing. Let the browser handle all network requests normally.
  // This prevents the PWA from accidentally showing an offline fallback text
  // when there is a tricky network or redirect situation.
});
