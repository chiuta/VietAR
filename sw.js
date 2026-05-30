/* VietAR service worker.
   IMPORTANT: documentul (HTML) e NETWORK-FIRST ca o reîncărcare să aducă mereu ultima versiune
   (evită „cache zombi" care servea o versiune veche la nesfârșit).
   Modelele HuggingFace sunt lăsate în seama transformers.js (cache propriu). */
const CACHE = 'vietar-v11';
const SHELL = [
  './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  // preia imediat controlul, înlocuind orice SW vechi
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// kill-switch: pagina poate cere SW-ului să se autodistrugă
self.addEventListener('message', e => {
  if (e.data === 'sw-unregister') {
    self.registration.unregister().then(() => caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))));
  }
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // version.json + HTML mereu din rețea (network-first), ca livrarea nouă să fie vizibilă imediat.
  if (url.pathname.endsWith('version.json')) {
    e.respondWith(fetch(req, {cache:'no-store'}).catch(() => caches.match(req)));
    return;
  }

  // Greutățile modelelor (HuggingFace) — gestionate de transformers.js.
  if (/(^|\.)huggingface\.co$|(^|\.)hf\.co$|cdn-lfs/.test(url.hostname)) return;

  // DOCUMENT (navigare sau index.html) → NETWORK-FIRST, fallback la cache doar offline.
  if (req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
    e.respondWith(
      fetch(req).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
        }
        return res;
      }).catch(() => caches.match('./index.html').then(r => r || caches.match(req)))
    );
    return;
  }

  // Restul (icoane, bibliotecă jsDelivr, fonturi Google) → stale-while-revalidate.
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
