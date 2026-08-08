#!/usr/bin/env node
/* ============================================================================
   Aggiunge una foto a ogni scheda che non ne ha una, pescando da Wikipedia
   (endpoint REST ufficiale, nessuna chiave richiesta). Non usa un LLM apposta:
   un modello può inventare un URL plausibile ma morto, Wikipedia no — o il
   file esiste o l'endpoint risponde 404 e saltiamo quella scheda senza
   scrivere niente di falso.

   Uso:
       node tools/fetch-images.mjs              # tutte le città
       node tools/fetch-images.mjs palermo       # una sola
   ============================================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = {
  napoli: 'data/poi-napoli.js', livorno: 'data/poi-livorno.js', marsiglia: 'data/poi-marsiglia.js',
  barcellona: 'data/poi-barcellona.js', tunisi: 'data/poi-tunisi.js', palermo: 'data/poi-palermo.js'
};

/* Query più efficace per il titolo giusto su Wikipedia: nome pulito + città,
   così "Pranzo: tapas e vermut" non cerca un titolo che non esiste ma
   comunque fallisce in modo pulito (nessuna foto, nessun errore fatale). */
/* Più varianti dalla più specifica alla più corta: la ricerca di MediaWiki
   perde risultati quando la frase è lunga e piena di parole di collegamento
   ("Vieux-Port e l'Ombrière di Norman Foster" non trova niente, "Vieux-Port"
   sì). Proviamo la frase intera, poi solo la parte prima del primo
   connettivo, poi solo le prime due parole. */
function varianti(nome, citta) {
  const base = nome.replace(/\s+[—–]\s+.*/, '').replace(/^[A-Za-zÀ-ÿ]+:\s*/, '')
    .replace(/\([^)]*\)/g, '').replace(/["']/g, '').trim();
  const corta = base.split(/\s+(?:e|di|del|della|dei|con|per|sui|alla|al)\s+/i)[0].trim();
  const brevissima = base.split(/\s+/).slice(0, 2).join(' ');
  return [...new Set([base, corta, brevissima])].filter(Boolean).map(q => q + ' ' + citta);
}

/* Poche parole in comune tra il nome cercato e il titolo trovato: basta a
   scartare i casi come "Sfogliatella" → una pagina qualunque sul cioccolato,
   senza dover interpretare il significato. */
function pertinente(nomeCercato, titoloTrovato) {
  const pulisci = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3);
  const a = new Set(pulisci(nomeCercato)), b = pulisci(titoloTrovato);
  return b.some(w => a.has(w));
}

/* Wikimedia rifiuta le richieste senza uno User-Agent identificativo — vedi
   https://meta.wikimedia.org/wiki/User-Agent_policy — e con troppe richieste
   ravvicinate risponde 429. Un header onesto e una pausa più larga bastano. */
const UA = 'PortPlanner-crociera/1.0 (script locale one-off, uso personale; contatto: ' +
  'progetto non pubblico)';

async function chiamaConRiprova(url, tentativo) {
  tentativo = tentativo || 1;
  const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' } });
  if (r.status === 429) {
    if (tentativo > 3) return null;
    await new Promise(res => setTimeout(res, 3000 * tentativo));
    return chiamaConRiprova(url, tentativo + 1);
  }
  return r.ok ? r.json() : null;
}

async function cercaSu(dominio, nomeOriginale, q) {
  /* Una sola chiamata: generator=search trova la pagina, prop=pageimages
     chiede direttamente la miniatura alla risoluzione che vogliamo — niente
     bisogno di una seconda richiesta né di ricostruire l'URL a mano. */
  const r = await chiamaConRiprova('https://' + dominio + '/w/api.php?action=query&generator=search&gsrlimit=1&gsrsearch=' +
    encodeURIComponent(q) + '&prop=pageimages&piprop=thumbnail&pithumbsize=900&format=json&origin=*').catch(() => null);
  const pagine = r && r.query && r.query.pages;
  const pagina = pagine && Object.values(pagine)[0];
  if (!pagina || !pertinente(nomeOriginale, pagina.title)) return null;
  if (!pagina.thumbnail || !pagina.thumbnail.source) return null;
  return { url: pagina.thumbnail.source, titolo: pagina.title + ' (' + dominio + ')' };
}

async function cercaESommario(nomeOriginale, varianti) {
  for (const dominio of ['it.wikipedia.org', 'en.wikipedia.org']) {
    for (const q of varianti) {
      const r = await cercaSu(dominio, nomeOriginale, q);
      if (r) return r;
      await new Promise(res => setTimeout(res, 900));
    }
  }
  return null;
}

async function main() {
  const soloCitta = process.argv[2];
  let trovate = 0, tentate = 0, saltate = 0;

  for (const [citta, file] of Object.entries(FILE)) {
    if (soloCitta && citta !== soloCitta) continue;
    const percorso = path.join(RADICE, file);
    let src = fs.readFileSync(percorso, 'utf8');

    /* Ogni scheda è un blocco { ... }, separato da righe vuote. La spacchiamo
       a mano invece di eval-arla: dobbiamo riscrivere il testo sorgente, non
       solo i dati in memoria. */
    const blocchi = src.split(/\n\{\n/).map((b, i) => i === 0 ? b : '{\n' + b);

    for (let i = 0; i < blocchi.length; i++) {
      const b = blocchi[i];
      const mid = b.match(/id:"([^"]+)"/);
      const mnome = b.match(/nome:"([^"]+)"/);
      if (!mid || !mnome) continue;
      if (/immagine\s*:/.test(b)) continue;             /* già ce l'ha */

      tentate++;
      const qs = varianti(mnome[1], citta[0].toUpperCase() + citta.slice(1));
      process.stdout.write('  ' + mnome[1] + ' … ');
      let ris = null;
      try { ris = await cercaESommario(mnome[1], qs); } catch (e) { /* pazienza, prossima */ }

      if (!ris) { console.log('nessuna foto pertinente'); saltate++; continue; }
      console.log('✓ (' + ris.titolo + ')');
      trovate++;

      /* Inserisce il campo immagine appena prima della chiusura del blocco,
         dopo l'ultimo campo esistente — non serve trovare un punto esatto,
         basta subito prima della '}' che chiude lo specifico oggetto POI. */
      const chiusura = b.lastIndexOf('\n}');
      const inserimento = `,\n  immagine:{url:${JSON.stringify(ris.url)}, credito:${JSON.stringify('Wikipedia — ' + ris.titolo)}}`;
      blocchi[i] = b.slice(0, chiusura) + inserimento + b.slice(chiusura);

      await new Promise(r => setTimeout(r, 1200));       /* garbo verso l'API pubblica */
    }

    const nuovo = blocchi.join('\n');
    if (nuovo !== src) fs.writeFileSync(percorso, nuovo);
  }

  console.log(`\n${trovate}/${tentate} foto trovate (${saltate} schede senza risultato utile, invariate).`);
}

main().catch(e => { console.error(e); process.exit(1); });
