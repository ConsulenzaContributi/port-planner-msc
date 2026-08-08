#!/usr/bin/env node
/* ============================================================================
   Costruisce la matrice dei tempi di percorrenza REALI con Google Maps,
   via Composio, e la congela in data/matrix.js.

   Perché: oggi il motore stima gli spostamenti geometricamente (distanza in
   linea d'aria × 1,35, diviso una velocità per mezzo). È prudente ma è una
   stima. Questo script la sostituisce con i tempi veri — a piedi e coi mezzi —
   calcolati UNA VOLTA e salvati nel repo. Il giorno dello scalo l'app resta
   completamente offline: legge il file, non chiama nessuno.

   Prerequisito (una volta sola, sei tu a doverlo fare):
       composio link google_maps

   Uso:
       node tools/build-matrix.mjs            # tutti gli scali
       node tools/build-matrix.mjs palermo    # un solo scalo
   ============================================================================ */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const exec = promisify(execFile);
const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* I file dati sono script per il browser: li eseguiamo in un contesto finto
   per riusarli senza duplicare nulla. */
function caricaDati() {
  const ctx = { window: {} };
  ctx.window.window = ctx.window;
  for (const f of ['data/cruise.js', 'data/poi-napoli.js', 'data/poi-livorno.js',
    'data/poi-marsiglia.js', 'data/poi-barcellona.js', 'data/poi-tunisi.js',
    'data/poi-palermo.js']) {
    const src = fs.readFileSync(path.join(RADICE, f), 'utf8');
    new Function('window', src)(ctx.window);
  }
  return ctx.window;
}

const chiave = c => c[0].toFixed(5) + ',' + c[1].toFixed(5);

/* Una sola chiamata origini×destinazioni. Non sa nulla di limiti o blocchi:
   quello lo decide chi la chiama (sotto). */
async function chiamataMatrice(origini, destinazioni, modo) {
  const corpo = JSON.stringify({
    origins: origini.map(p => ({ latitude: p.coord[0], longitude: p.coord[1] })),
    destinations: destinazioni.map(p => ({ latitude: p.coord[0], longitude: p.coord[1] })),
    travelMode: modo,
    units: 'METRIC',
    fieldMask: 'originIndex,destinationIndex,duration,distanceMeters,condition'
  });
  const { stdout } = await exec('composio',
    ['execute', 'GOOGLE_MAPS_COMPUTE_ROUTE_MATRIX', '-d', corpo],
    { maxBuffer: 32 * 1024 * 1024 });
  const r = JSON.parse(stdout);
  if (!r.successful) throw new Error(typeof r.error === 'string' ? r.error : JSON.stringify(r.error));
  /* Sopra una certa dimensione Composio non mette i dati inline nella
     risposta: li scrive su un file temporaneo e restituisce solo il
     percorso. Va letto da lì. */
  const dati = r.storedInFile && r.outputFilePath
    ? JSON.parse(fs.readFileSync(r.outputFilePath, 'utf8'))
    : r;
  /* elements è piatto e può essere fuori ordine: si ricostruisce SEMPRE
     tramite originIndex/destinationIndex, mai per posizione. */
  const el = dati.data?.elements || dati.data?.response_data?.elements || dati.elements || [];
  const fuori = [];
  for (const e of el) {
    if (e.condition !== 'ROUTE_EXISTS') continue;
    const oPunto = origini[e.originIndex], dPunto = destinazioni[e.destinationIndex];
    if (!oPunto || !dPunto || oPunto === dPunto) continue;
    const sec = parseInt(String(e.duration ?? '0').replace(/s$/, ''), 10);
    if (!Number.isFinite(sec) || sec <= 0) continue;
    fuori.push({ da: chiave(oPunto.coord), a: chiave(dPunto.coord), min: Math.round(sec / 60), m: e.distanceMeters ?? null });
  }
  return fuori;
}

function blocchi(arr, dim) {
  const out = [];
  for (let i = 0; i < arr.length; i += dim) out.push(arr.slice(i, i + dim));
  return out;
}

/* Google limita TRANSIT a 100 elementi (origini × destinazioni) per
   chiamata; WALK non ha questo limite ma sopra una certa taglia Composio
   comunque smette di rispondere inline (gestito sopra). Per restare sotto
   100 anche nel caso peggiore (denso di città con più di 10 punti) si
   spezza la griglia in blocchi quadrati e si sommano i risultati — funziona
   per qualunque numero di attrazioni, non solo per quelle di oggi. */
async function matriceComposio(punti, modo) {
  const dimBlocco = modo === 'TRANSIT' ? 9 : 20;      /* 9×9=81<100; WALK più larga */
  const gruppi = blocchi(punti, dimBlocco);
  const fuori = [];
  for (const gO of gruppi) {
    for (const gD of gruppi) {
      const righe = await chiamataMatrice(gO, gD, modo);
      fuori.push(...righe);
      if (gruppi.length > 1) await new Promise(r => setTimeout(r, 300));   /* garbo verso l'API */
    }
  }
  return fuori;
}

async function main() {
  const W = caricaDati();
  const soloScalo = process.argv[2];
  const matrice = {};
  let totale = 0;

  for (const s of W.CRUISE.scali) {
    if (s.tipo === 'mare') continue;
    if (soloScalo && s.id !== soloScalo) continue;

    const k = s.id.split('-')[0];
    const poi = [].concat(W.POI_napoli, W.POI_livorno, W.POI_marsiglia,
      W.POI_barcellona, W.POI_tunisi, W.POI_palermo).filter(p => p.scalo === k);

    const punti = [
      { id: '__gw', coord: (s.accesso && s.accesso.arrivoCitta) || s.ormeggio.coord },
      ...poi.map(p => ({ id: p.id, coord: p.coord }))
    ];
    if (punti.length < 2) continue;
    if (punti.length > 25) console.warn(`  ⚠︎ ${s.citta}: ${punti.length} punti = ${punti.length ** 2} elementi`);

    matrice[s.id] = { piedi: {}, mezzi: {} };
    for (const [modo, campo] of [['WALK', 'piedi'], ['TRANSIT', 'mezzi']]) {
      process.stdout.write(`  ${s.citta} · ${modo} … `);
      try {
        const righe = await matriceComposio(punti, modo);
        righe.forEach(r => { matrice[s.id][campo][r.da + '|' + r.a] = [r.min, r.m]; });
        totale += righe.length;
        console.log(`${righe.length} tratte`);
      } catch (err) {
        console.log('✗ ' + err.message);
        if (/No active connection/i.test(err.message)) {
          console.error('\n→ Devi autorizzare Google una volta sola:  composio link google_maps\n');
          process.exit(1);
        }
      }
    }
  }

  const uscita = path.join(RADICE, 'data', 'matrix.js');
  fs.writeFileSync(uscita,
    '/* Tempi di percorrenza REALI da Google Maps (via Composio).\n' +
    '   Generato da tools/build-matrix.mjs — non modificare a mano.\n' +
    '   Chiave: "lat,lng|lat,lng" → [minuti, metri]. Il motore lo usa se presente,\n' +
    '   altrimenti torna alla stima geometrica. Rigeneralo quando aggiungi tappe.\n' +
    '   Generato il: ' + new Date().toISOString().slice(0, 10) + ' */\n\n' +
    'window.MATRIX = ' + JSON.stringify(matrice, null, 1) + ';\n');

  console.log(`\n✓ ${totale} tratte reali scritte in data/matrix.js`);
  console.log('  Aggiungi <script src="data/matrix.js"></script> in index.html (prima di js/engine.js).');
}

main().catch(e => { console.error(e); process.exit(1); });
