// Minimal Service Worker

self.addEventListener('install', event => {
  // Activate worker immediately
  self.skipWaiting();
  console.log('Service Worker Installed');
});

self.addEventListener('fetch', event => {
  // Just pass through all fetch requests for now
  event.respondWith(fetch(event.request));
});
