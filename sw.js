/* Aprèn en Calma — service worker.
   L'app ha de funcionar sense connexió, però una versió nova d'index.html
   s'ha de veure de seguida. Per això:
     · documents  → xarxa primer, memòria cau com a xarxa de seguretat
     · icones i manifest → memòria cau primer (mai no canvien)
   Puja CACHE quan canviïn els fitxers estàtics. */
const CACHE = 'aprenencalma-v3'
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './fonts/quicksand-variable-latin.woff2',
  './fonts/andika-400-latin.woff2',
  './fonts/andika-700-latin.woff2'
]

/* skipWaiting aquí mateix: el worker nou agafa el relleu sense esperar que es
   tanquin les pestanyes obertes, i per tant la pàgina no l'hi ha de demanar. */
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const req = e.request
  if (req.method !== 'GET') return
  if (new URL(req.url).origin !== self.location.origin) return

  const isDoc = req.mode === 'navigate' || req.destination === 'document'

  if (isDoc) {
    /* xarxa primer: mentre hi hagi servidor sempre es veu l'última versió */
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone()
          caches.open(CACHE).then(c => c.put('./index.html', copy))
          return res
        })
        .catch(() => caches.match(req, { ignoreSearch: true })
          .then(hit => hit || caches.match('./index.html')))
    )
    return
  }

  /* estàtics: resposta immediata de la memòria cau i actualització al darrere */
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      const net = fetch(req)
        .then(res => {
          if (res && res.ok && res.type === 'basic') {
            const copy = res.clone()
            caches.open(CACHE).then(c => c.put(req, copy))
          }
          return res
        })
        .catch(() => hit)
      return hit || net
    })
  )
})
