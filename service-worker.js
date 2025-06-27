self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('controle-financeiro').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './style.css',
        './app.js',
        './manifest.json',
        './icon-192.png',
        './icon-512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(resposta => {
      return resposta || fetch(e.request);
    })
  );
});
