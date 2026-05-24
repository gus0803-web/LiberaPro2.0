self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A simple pass-through fetch handler is enough to pass the PWA installability criteria
  // For a full offline experience, you would use caches here.
  event.respondWith(fetch(event.request).catch(() => {
    return new Response('Offline content goes here', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }));
});
