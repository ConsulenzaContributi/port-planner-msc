/* ============================================================================
   Proxy LLM locale per Port Planner — Google Gemini.

   Perché esiste: la chiave API non deve MAI stare dentro la pagina web.
   Il browser parla con questo processo, questo processo parla con Google.
   La chiave vive solo in server/.env, che è in .gitignore.

   Avvio:
     cd server && npm install
     node llm-proxy.mjs

   Tre endpoint:
     GET  /api/ping     stato e modello
     POST /api/scheda   compila la scheda di un'attrazione, CERCANDO SU INTERNET
     POST /api/chiedi   domande in streaming, con ricerca web quando serve
     POST /api/agente   agente con strumenti: legge e modifica i programmi

   La ricerca web (googleSearch) è ciò che rende utile Gemini qui: i prezzi e
   gli orari non escono più dalla memoria del modello ma da pagine reali, e le
   fonti tornano al browser così si possono controllare.
   ============================================================================ */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

/* ------------------------------------------------------- .env senza librerie */
const QUI = path.dirname(fileURLToPath(import.meta.url));
for (const riga of (fs.existsSync(path.join(QUI, '.env'))
  ? fs.readFileSync(path.join(QUI, '.env'), 'utf8').split('\n') : [])) {
  const m = riga.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const PORTA = Number(process.env.PORT || 8787);
const MODELLO = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY mancante. Mettila in server/.env — vedi .env.example.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/* ------------------------------------------------------------------ prompt */

const RUOLO = `Sei l'assistente di viaggio di una coppia (marito e moglie, senza figli) in crociera
sulla MSC Meraviglia dal 26 settembre al 3 ottobre 2026, itinerario Napoli → Livorno →
Marsiglia → Barcellona → La Goletta/Tunisi → Palermo → Napoli.

Vincoli che governano ogni tua risposta:
- Si visita SOLO la città di sbarco. Niente gite fuori porta.
- Il budget è 50 € a persona per tappa, cioè 100 € a coppia.
- Il vincolo non negoziabile è l'orario di "tutti a bordo": perdere la nave è il
  fallimento che questa app esiste per evitare. Quando parli di tempi, ragiona
  sempre a ritroso da quell'ora.
- A Tunisi l'ora locale a terra è UN'ORA INDIETRO rispetto all'ora di bordo.
  Ragiona e rispondi sempre in ora di bordo, e dillo quando è rilevante.

Hai la ricerca web. Usala ogni volta che servono prezzi, orari, giorni di chiusura,
regole di prenotazione o notizie sui porti: sono dati che cambiano e che non devi
tirare a indovinare. Se dopo la ricerca un dato resta incerto, dillo apertamente
invece di inventarlo.

Rispondi in italiano, diretto e concreto. Dai numeri quando li hai (minuti, euro, orari).`;

const CATEGORIE = ['iconico', 'arte', 'chiese', 'architettura', 'storia', 'quartieri',
  'cibo', 'panorami', 'mare', 'natura', 'shopping', 'esperienze'];

/* googleSearch e responseSchema non si possono combinare: la ricerca vale più
   dello schema imposto, quindi chiediamo il JSON nel prompt e lo estraiamo in
   modo difensivo. Ogni campo viene comunque normalizzato nel browser (inPoi in
   js/llm.js), quindi un campo mancante non rompe niente. */
const ISTRUZIONI_SCHEDA = `Compila la scheda di UNA attrazione.

Prima cerca su internet: sito ufficiale, orari e giorni di chiusura aggiornati, prezzo
del biglietto, se serve la prenotazione a fascia oraria. Poi rispondi SOLO con un
oggetto JSON, senza testo prima o dopo, senza blocchi markdown.

Campi richiesti (rispetta tipi e nomi esattamente):
{
  "nome": stringa,
  "cat": array di 1-3 valori tra ${CATEGORIE.map(c => '"' + c + '"').join(', ')},
  "lat": numero, "lng": numero,
  "top": intero 1-5 (5 = imperdibile),
  "durataVeloce": interi minuti, "durataMedio": interi minuti, "durataLento": interi minuti,
  "prezzo": numero (euro A PERSONA, 0 se gratis), "prezzoNote": stringa,
  "orariDa": "HH:MM", "orariA": "HH:MM",
  "chiusoGiorni": array di interi (0=domenica … 6=sabato), [] se apre sempre,
  "slot": booleano (true se serve biglietto a fascia oraria obbligatoria),
  "prenotaUrl": stringa ("" se non l'hai trovato),
  "prenotaAnticipoGiorni": intero, "prenotaNote": stringa, "saltafila": stringa,
  "codaTipica": intero minuti, "codaPunta": intero minuti,
  "faticaKm": numero, "faticaGradini": intero,
  "faticaOmbra": una di "nessuna","scarsa","parziale","buona","totale",
  "quando": una di "mattina","pomeriggio","pranzo","qualsiasi",
  "perche": stringa di 3-5 frasi concrete e specifiche,
  "visita": array di 3-5 stringhe brevi (cosa non perdere sul posto),
  "tips": array di 2-4 consigli pratici,
  "wc": stringa,
  "immagineUrl": stringa ("" se non trovi un URL diretto a un'immagine, mai inventarlo),
  "immagineCredito": stringa breve (es. "Wikimedia Commons", "sito ufficiale")
}

Regole:
- Coordinate reali. Se non le trovi con precisione usa quelle del quartiere e scrivilo nei tips.
- Prezzi in euro A PERSONA. Per Tunisi converti dai dinari e dillo in prezzoNote.
- prenotaUrl solo se l'hai VISTO in una fonte. Mai inventare URL.
- Le durate sono minuti di visita effettivi, senza spostamenti: quelli li calcola l'app.
- Sii specifico: "bella chiesa storica" è inutile. Di' cosa c'è dentro e perché conta.
- Nei tips scrivi da dove viene il prezzo e a che data risale.
- immagineUrl SOLO se hai trovato un link diretto a un file immagine (jpg/png/webp) da una fonte affidabile (Wikimedia Commons, sito ufficiale). Se hai solo la pagina che la contiene, lascia "" invece di inventare o linkare la pagina HTML.`;

/* Guida punto-per-punto pensata per essere letta DURANTE la visita, non
   prima: ogni punto ha un tempo dentro la visita (non un orario assoluto —
   quello lo sa solo il piano del giorno) così regge qualunque ritmo scelto. */
const ISTRUZIONI_APPROFONDIMENTO = `Crea una guida alla visita punto-per-punto per UNA attrazione, da seguire
mentre ci si è dentro. Cerca su internet per i dettagli specifici (chi l'ha costruita,
cosa vedere in una stanza precisa, aneddoti verificabili) — niente generico.

Rispondi SOLO con un oggetto JSON, senza testo prima o dopo, senza blocchi markdown:
{
  "introduzione": stringa breve (2-3 frasi: come muoversi appena entrati),
  "punti": array di 4-7 oggetti { "daMin": intero, "titolo": stringa, "testo": stringa di
    3-5 frasi molto concrete (cosa guardare esattamente, dove si trova, perché conta) },
  "chiusura": stringa breve (1-2 frasi: l'ultima cosa da non perdere prima di uscire),
  "immagini": array di 0-3 oggetti { "url": link diretto a un file immagine reale trovato
    cercando (Wikimedia Commons o sito ufficiale, mai inventato), "credito": stringa breve }
}

Regole:
- "daMin" è il minuto dall'inizio della visita in cui quel punto ha senso (0, poi crescente),
  calibrato sulla durata_minuti indicata: l'ultimo punto deve stare ragionevolmente
  entro la durata data, non oltre.
- Ogni punto deve poter essere letto in 20-30 secondi mentre si è in piedi davanti alla cosa.
- Zero generico: non "ammira gli affreschi", ma cosa raffigurano e dove guardare esattamente.
- immagini SOLO con URL diretti a file veri, mai pagine HTML, mai inventati: meglio [] che un link morto.`;

/* --------------------------------------------- strumenti dell'agente

   Le funzioni NON girano qui: girano nel browser, dove stanno il motore e i
   programmi. Questo processo decide solo QUALE chiamare e con quali argomenti;
   il browser esegue, risponde, e il ciclo prosegue. È il motivo per cui
   l'agente può davvero cambiare la giornata invece di limitarsi a consigliarla. */

const STRUMENTI = [{
  functionDeclarations: [
    {
      name: 'cerca_catalogo',
      description: 'Cerca attrazioni già schedate in una città, con prezzo, durata, orari e se stanno nel tempo che resta.',
      parameters: {
        type: 'object',
        properties: {
          scalo: { type: 'string', description: 'napoli, livorno, marsiglia, barcellona, tunisi, palermo' },
          testo: { type: 'string', description: 'parola chiave o categoria; vuoto = tutte' }
        },
        required: ['scalo']
      }
    },
    {
      name: 'leggi_programma',
      description: 'Legge il programma attuale di una giornata: tappe, orari, spostamenti, spesa, margine e rischio.',
      parameters: {
        type: 'object',
        properties: { scalo: { type: 'string' } },
        required: ['scalo']
      }
    },
    {
      name: 'aggiungi_tappa',
      description: 'Aggiunge un\'attrazione al programma di una giornata, nella posizione migliore. Fallisce se non ci sta nel tempo o nel budget.',
      parameters: {
        type: 'object',
        properties: { scalo: { type: 'string' }, poiId: { type: 'string' } },
        required: ['scalo', 'poiId']
      }
    },
    {
      name: 'rimuovi_tappa',
      description: 'Toglie un\'attrazione dal programma di una giornata.',
      parameters: {
        type: 'object',
        properties: { scalo: { type: 'string' }, poiId: { type: 'string' } },
        required: ['scalo', 'poiId']
      }
    },
    {
      name: 'genera_programma',
      description: 'Costruisce da zero una giornata completa e fattibile con il ritmo scelto. Sostituisce il programma esistente.',
      parameters: {
        type: 'object',
        properties: {
          scalo: { type: 'string' },
          ritmo: { type: 'string', description: 'lento, medio o veloce' }
        },
        required: ['scalo', 'ritmo']
      }
    },
    {
      name: 'crea_scheda',
      description: 'Crea una scheda nuova per un posto che non è ancora nel catalogo, cercandone i dati su internet, e la aggiunge alla città.',
      parameters: {
        type: 'object',
        properties: {
          scalo: { type: 'string' },
          descrizione: { type: 'string', description: 'anche approssimativa: "la pasticceria storica vicino ai Quattro Canti"' }
        },
        required: ['scalo', 'descrizione']
      }
    }
  ]
}];

const RUOLO_AGENTE = RUOLO + `

Sei un agente: hai strumenti che leggono e MODIFICANO davvero i programmi dell'app.
Quando l'utente chiede di cambiare una giornata, non descrivere che cosa farebbe:
fallo con gli strumenti e poi racconta il risultato in due righe.

Regole di condotta:
- Prima di modificare, leggi (leggi_programma, cerca_catalogo). Non agire alla cieca.
- Usa gli id esatti restituiti dal catalogo, mai nomi inventati.
- Se aggiungi_tappa fallisce per mancanza di tempo o budget, non insistere:
  spiega che cosa sfora e di quanto, e proponi l'alternativa.
- genera_programma cancella il lavoro già fatto: usalo solo se l'utente lo chiede
  chiaramente o se la giornata è vuota.
- Alla fine dì sempre come sono cambiati margine e spesa.`;

/* ------------------------------------------------------------------ utilità */

const json = (res, code, body) => {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
};
function cors(req, res) {
  res.setHeader('access-control-allow-origin', req.headers.origin || '*');
  res.setHeader('access-control-allow-headers', 'content-type');
  res.setHeader('access-control-allow-methods', 'POST, GET, OPTIONS');
}
async function leggiCorpo(req) {
  const parti = [];
  for await (const c of req) parti.push(c);
  return JSON.parse(Buffer.concat(parti).toString('utf8') || '{}');
}

/* Estrazione difensiva del JSON: prende il primo oggetto bilanciato. */
function estraiJson(testo) {
  const t = String(testo || '').replace(/^```(?:json)?/im, '').replace(/```\s*$/m, '').trim();
  const inizio = t.indexOf('{');
  if (inizio < 0) throw new Error('il modello non ha restituito JSON');
  let liv = 0, dentroStringa = false, fuga = false;
  for (let i = inizio; i < t.length; i++) {
    const ch = t[i];
    if (fuga) { fuga = false; continue; }
    if (ch === '\\') { fuga = true; continue; }
    if (ch === '"') { dentroStringa = !dentroStringa; continue; }
    if (dentroStringa) continue;
    if (ch === '{') liv++;
    else if (ch === '}' && --liv === 0) return JSON.parse(t.slice(inizio, i + 1));
  }
  throw new Error('JSON incompleto: risposta troncata');
}

/* Le fonti della ricerca web: servono a poter controllare i numeri. */
function fonti(risposta) {
  const g = risposta?.candidates?.[0]?.groundingMetadata;
  const chunk = g?.groundingChunks || [];
  const viste = new Set();
  return chunk.map(c => c.web).filter(Boolean)
    .filter(w => w.uri && !viste.has(w.uri) && viste.add(w.uri))
    .map(w => ({ titolo: w.title || w.uri, url: w.uri }))
    .slice(0, 8);
}

/* ------------------------------------------------ generazione della scheda */

async function generaScheda(dati) {
  const utente = `Città di sbarco: ${dati.citta}
Data della visita: ${dati.data} (${dati.giorno})
Finestra utile a terra: ${dati.finestra}

Attrazione da schedare, descritta da me:
"""
${dati.descrizione}
"""`;

  const contenuti = [{ role: 'user', parts: [{ text: utente }] }];

  for (let tentativo = 1; tentativo <= 2; tentativo++) {
    const r = await ai.models.generateContent({
      model: MODELLO,
      contents: contenuti,
      config: {
        systemInstruction: RUOLO + '\n\n' + ISTRUZIONI_SCHEDA,
        temperature: 0.4,
        tools: [{ googleSearch: {} }]
      }
    });
    const testo = r.text || '';
    try {
      const scheda = estraiJson(testo);
      scheda._fonti = fonti(r);
      return scheda;
    } catch (err) {
      if (tentativo === 2)
        throw new Error('Il modello non ha prodotto un JSON valido. Riprova, o compila la scheda a mano.');
      /* Un solo tentativo di riparazione, mostrando l'errore al modello. */
      contenuti.push({ role: 'model', parts: [{ text: String(testo).slice(0, 2000) }] });
      contenuti.push({ role: 'user', parts: [{ text: `Errore: ${err.message}. Rispondi SOLO con l'oggetto JSON, niente altro.` }] });
    }
  }
}

async function generaApprofondimento(dati) {
  const utente = `Attrazione: ${dati.nome}
Città: ${dati.citta}
Perché vale la visita, dalla nostra scheda: ${dati.perche || '—'}
Durata di visita prevista: ${dati.durataMin} minuti
Punti già segnalati come da non perdere: ${(dati.visita || []).join('; ') || '—'}`;

  const contenuti = [{ role: 'user', parts: [{ text: utente }] }];

  for (let tentativo = 1; tentativo <= 2; tentativo++) {
    const r = await ai.models.generateContent({
      model: MODELLO,
      contents: contenuti,
      config: {
        systemInstruction: RUOLO + '\n\n' + ISTRUZIONI_APPROFONDIMENTO,
        temperature: 0.5,
        tools: [{ googleSearch: {} }]
      }
    });
    const testo = r.text || '';
    try {
      const guida = estraiJson(testo);
      guida._fonti = fonti(r);
      return guida;
    } catch (err) {
      if (tentativo === 2)
        throw new Error('Il modello non ha prodotto un JSON valido. Riprova tra poco.');
      contenuti.push({ role: 'model', parts: [{ text: String(testo).slice(0, 2000) }] });
      contenuti.push({ role: 'user', parts: [{ text: `Errore: ${err.message}. Rispondi SOLO con l'oggetto JSON, niente altro.` }] });
    }
  }
}

/* ------------------------------------------------------- domande e risposte */

async function chiedi(dati, res) {
  const storico = (dati.storico || []).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content || '') }]
  }));

  const stream = await ai.models.generateContentStream({
    model: MODELLO,
    contents: storico.concat([{
      role: 'user',
      parts: [{ text: `Stato attuale dei miei programmi:\n${dati.stato}\n\nDomanda: ${dati.domanda}` }]
    }]),
    config: {
      systemInstruction: RUOLO + '\n\nCONTESTO DEL VIAGGIO\n' + dati.contesto,
      temperature: 0.7,
      tools: [{ googleSearch: {} }]
    }
  });

  res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-cache' });
  let ultimo = null;
  for await (const pezzo of stream) {
    ultimo = pezzo;
    const t = pezzo.text;
    if (t) res.write(t);
  }
  /* Le fonti in coda, così il testo resta pulito mentre scorre. */
  const f = fonti(ultimo);
  if (f.length) res.write('\n\nFonti: ' + f.map(x => x.titolo + ' — ' + x.url).join(' · '));
  res.end();
}

/* -------------------------------------------------------------- agente

   Un turno per chiamata: il browser esegue lo strumento e ripassa la storia.
   Così il ciclo agentico esiste davvero ma lo stato resta dove deve stare. */

async function agente(dati) {
  const r = await ai.models.generateContent({
    model: MODELLO,
    contents: dati.contenuti || [],
    config: {
      systemInstruction: RUOLO_AGENTE + '\n\nCONTESTO DEL VIAGGIO\n' + dati.contesto +
        '\n\nSTATO ATTUALE\n' + dati.stato,
      temperature: 0.4,
      tools: STRUMENTI
    }
  });

  const chiamate = r.functionCalls || [];
  if (chiamate.length) return { tipo: 'strumenti', chiamate: chiamate.map(c => ({ nome: c.name, args: c.args || {} })) };
  return { tipo: 'testo', testo: r.text || '' };
}

/* ------------------------------------------------------------------ server */

const server = http.createServer(async (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method === 'GET' && req.url === '/api/ping')
    return json(res, 200, { ok: true, provider: 'gemini', modello: MODELLO, ricercaWeb: true, agente: true });
  if (req.method !== 'POST') return json(res, 404, { errore: 'non trovato' });

  try {
    const dati = await leggiCorpo(req);
    if (req.url === '/api/scheda') return json(res, 200, await generaScheda(dati));
    if (req.url === '/api/approfondimento') return json(res, 200, await generaApprofondimento(dati));
    if (req.url === '/api/agente') return json(res, 200, await agente(dati));
    if (req.url === '/api/chiedi') return await chiedi(dati, res);
    return json(res, 404, { errore: 'endpoint sconosciuto' });
  } catch (err) {
    console.error(err);
    const t = String(err && err.message || '');
    const msg = /API key|API_KEY_INVALID|PERMISSION_DENIED|401|403/i.test(t)
      ? 'Chiave Gemini non valida o senza permessi: rigenerala su aistudio.google.com/apikey e aggiorna server/.env.'
      : /RESOURCE_EXHAUSTED|429|quota/i.test(t)
        ? 'Quota Gemini esaurita per ora: riprova tra qualche minuto.'
        : (t || 'errore sconosciuto');
    if (!res.headersSent) json(res, 500, { errore: msg });
    else res.end('\n\n[Errore: ' + msg + ']');
  }
});

server.listen(PORTA, '127.0.0.1', () => {
  console.log(`Proxy LLM attivo su http://localhost:${PORTA}`);
  console.log(`Provider Google Gemini · modello ${MODELLO} · ricerca web attiva`);
  console.log('Lascialo girare mentre usi l\'app. Ctrl-C per fermarlo.');
});
