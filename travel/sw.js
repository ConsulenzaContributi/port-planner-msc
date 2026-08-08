/* Service worker — l'app deve aprirsi anche senza rete, incluse le tessere
   mappa già viste (IDEA PREMIUM 4 — modalità offline).

   Strategia: rete-prima-poi-cache per i file dell'app, cache-prima per le
   tessere della mappa (immutabili e pesano). Le chiamate a Supabase e a
   Gemini non si mettono mai in cache: una risposta vecchia dell'assistente
   sarebbe peggio di nessuna risposta.

   NOTA sul "download esplicito della zona": qui la cache si riempie solo con
   le tessere che l'utente ha già visto scorrendo la mappa (cache incidentale).
   Un vero download proattivo ("scarica l'area di Firenze prima di partire")
   richiede di enumerare in anticipo le tessere del riquadro di interesse a
   vari livelli di zoom e richiamare cacheTessere() sotto — non implementato
   qui perché dipende dalla libreria mappa scelta (Leaflet + plugin offline,
   o MapLibre con storage vettoriale). */

const CACHE = 'travel-planner-v1';
const GUSCIO = [
  './', './index.html', './manifest.json', './icona.svg', './css/app.css',
  './data/viaggio-esempio.js', './data/supabase.js',
  './data/attivita-roma.js', './data/attivita-firenze.js',
  './js/engine.js', './js/ui.js', './js/llm.js', './js/cloud.js',
  './js/budget.js', './js/meteo.js', './js/export.js', './js/prenotazioni.js',
  './js/voce.js', './js/ritmo-personalizzato.js', './js/pasti.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(GUSCIO.map(u => c.add(u).catch(() => { }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});

/* Chiamabile da js/ per pre-scaricare esplicitamente un elenco di URL di
   tessere mappa (idea premium 4: "scarica l'area prima di partire"). */
async function cacheTessere(urls) {
  const c = await caches.open(CACHE);
  await Promise.all(urls.map(u => fetch(u).then(r => r.ok && c.put(u, r)).catch(() => {})));
}
self.addEventListener('message', e => {
  if (e.data && e.data.tipo === 'scarica-tessere') cacheTessere(e.data.urls || []);
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
