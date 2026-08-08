/* Service worker — l'app deve aprirsi anche senza rete.

   Strategia: rete-prima-poi-cache per i file dell'app (così un aggiornamento
   arriva subito quando la rete c'è), cache-prima per le tessere della mappa
   (sono immutabili e pesano). Le chiamate a Supabase e a Gemini non si mettono
   mai in cache: una risposta vecchia dell'assistente sarebbe peggio di nessuna
   risposta. */

const CACHE = 'port-planner-v1';
const GUSCIO = [
  './', './index.html', './manifest.json', './icona.svg', './css/app.css',
  './data/cruise.js', './data/supabase.js',
  './data/poi-napoli.js', './data/poi-livorno.js', './data/poi-marsiglia.js',
  './data/poi-barcellona.js', './data/poi-tunisi.js', './data/poi-palermo.js',
  './js/engine.js', './js/ui.js', './js/llm.js', './js/cloud.js'
];

self.addEventListener('install', e => {
  /* addAll fallisce tutto se un file manca (es. data/matrix.js non ancora
     generato): li aggiungiamo uno per uno e tolleriamo le assenze. */
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(GUSCIO.map(u => c.add(u).catch(() => { }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.hostname.endsWith('supabase.co') || url.hostname.includes('googleapis.com')) return;

  const tessera = url.hostname.includes('tile.openstreetmap');
  if (tessera) {
    e.respondWith(caches.match(req).then(c => c || fetch(req).then(r => {
      const copia = r.clone();
      caches.open(CACHE).then(x => x.put(req, copia));
      return r;
    }).catch(() => c)));
    return;
  }

  e.respondWith(
    fetch(req).then(r => {
      if (r && r.ok && url.origin === location.origin) {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
      }
      return r;
    }).catch(() => caches.match(req).then(c => c || caches.match('./index.html')))
  );
});
