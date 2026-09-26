/* Service worker minimal — condition d'installabilité PWA sur Chrome/Edge (Android et ordinateur),
   et bonus : l'application continue de s'ouvrir même sans connexion internet, une fois visitée une
   première fois. Stratégie « réseau d'abord, cache en secours » : la dernière version en ligne est
   toujours privilégiée quand la connexion est bonne, pour ne jamais servir une version périmée. */
const CACHE_NAME = 'tekoulo-centre-v1';
const CORE_ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon-32.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS).catch(()=>{}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(()=>{});
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});
