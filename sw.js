/* VietAR service worker — offline app shell.
   Modelele de pe huggingface.co sunt lăsate în seama transformers.js (Cache API propriu),
   ca să nu dublăm sute de MB. Aici cache-uim doar învelișul aplicației + biblioteca CDN + fonturile. */
const CACHE = 'vietar-v1';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Lăsăm greutățile modelelor (HuggingFace) să fie gestionate de transformers.js.
  if (/(^|\.)huggingface\.co$|(^|\.)hf\.co$|cdn-lfs/.test(url.hostname)) return;

  // Navigare → servește învelișul din cache (lansare offline).
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('./index.html').then(r => r || fetch(req)));
    return;
  }

  // Restul (shell same-origin + bibliotecă jsDelivr + Google Fonts) → stale-while-revalidate.
  e.respondWith(
    caches.match(req).then(cached => {
      const net = fetch(req).then(res => {
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
