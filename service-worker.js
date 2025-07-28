const CACHE_NAME = 'controle-financeiro-v6';  // altere a versão a cada update

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './style.css',
        './app.js',
        './manifest.json',
        './imagens/icon-192.png',
        './imagens/icon-512.png'
      ]);
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
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
