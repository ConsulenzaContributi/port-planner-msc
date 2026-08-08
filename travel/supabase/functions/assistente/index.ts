/* ============================================================================
   Travel Planner — assistente su Supabase Edge Function.

   Generalizzazione di supabase/functions/assistente/index.ts del progetto
   crociera: stessa architettura (Gemini + function-calling + google_search),
   ma senza vincoli specifici a una crociera (niente "tutti a bordo", niente
   fuso nave). I vincoli qui sono generici a qualunque viaggio: orari di
   apertura, check-in/check-out dell'alloggio, budget giornaliero, distanza
   dal luogo di pernotto.

   Rotte (in POST, campo "azione"): "scheda" | "approfondimento" | "chiedi" | "agente"
   ============================================================================ */

const CHIAVE = Deno.env.get('GEMINI_API_KEY');
const MODELLO = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, GET, OPTIONS'
};

/* ------------------------------------------------------------------ prompt */

const RUOLO = `Sei l'assistente di viaggio dentro un'app che organizza itinerari multi-tappa:
l'utente carica data di partenza, data di arrivo e le tappe del viaggio, ciascuna con i
suoi giorni di permanenza e un alloggio. Il tuo compito è aiutare a riempire ogni giorno
di ogni tappa con attività fattibili, vicine al luogo di pernotto, dentro il tempo e il
budget disponibili.

Vincoli che governano ogni tua risposta:
- Le attività proposte devono essere ragionevolmente vicine all'alloggio della tappa: più
  la distanza cresce, più cala la priorità, a meno che l'utente chieda esplicitamente di
  allargare il raggio.
- Il budget è un tetto giornaliero a persona (vedi CONTESTO DEL VIAGGIO): quando proponi
  attività a pagamento, tieni conto di quanto budget resta nella giornata.
- Il vincolo non negoziabile è il rientro in alloggio in orario ragionevole (o, l'ultimo
  giorno di una tappa, in tempo per il trasferimento verso la tappa successiva). Quando
  parli di tempi, ragiona sempre a ritroso da quell'orario.
- Rispetta gli orari di apertura e i giorni di chiusura delle attività.

Hai la ricerca web. Usala ogni volta che servono prezzi, orari, giorni di chiusura, regole
di prenotazione o notizie sul luogo: sono dati che cambiano e che non devi tirare a
indovinare. Se dopo la ricerca un dato resta incerto, dillo apertamente invece di inventarlo.

Rispondi in italiano, diretto e concreto. Dai numeri quando li hai (minuti, euro, orari, km).`;

const CATEGORIE = ['iconico', 'arte', 'chiese', 'architettura', 'storia', 'quartieri',
  'cibo', 'panorami', 'mare', 'natura', 'shopping', 'esperienze'];

const ISTRUZIONI_SCHEDA = `Compila la scheda di UNA attività/attrazione.

Prima cerca su internet: sito ufficiale, orari e giorni di chiusura aggiornati, prezzo del
biglietto, se serve la prenotazione a fascia oraria, coordinate GPS precise. Poi rispondi
SOLO con un oggetto JSON, senza testo prima o dopo, senza blocchi markdown.

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
  "quando": una di "mattina","pomeriggio","pranzo","qualsiasi",
  "perche": stringa di 3-5 frasi concrete e specifiche,
  "visita": array di 3-5 stringhe brevi (cosa non perdere sul posto),
  "tips": array di 2-4 consigli pratici,
  "wc": stringa,
  "immagineUrl": stringa ("" se non trovi un URL diretto a un'immagine, mai inventarlo),
  "immagineCredito": stringa breve (es. "Wikimedia Commons", "sito ufficiale")
}

Regole:
- Coordinate reali e precise: servono per calcolare la distanza dall'alloggio.
- Prezzi in euro A PERSONA (converti da valuta locale e spiegalo in prezzoNote).
- prenotaUrl solo se l'hai VISTO in una fonte. Mai inventare URL.
- Le durate sono minuti di visita effettivi, senza spostamenti: quelli li calcola l'app.
- Sii specifico: "bel posto storico" è inutile. Di' cosa c'è e perché conta.`;

const ISTRUZIONI_APPROFONDIMENTO = `Crea una guida alla visita punto-per-punto per UNA attività, da seguire
mentre ci si è dentro. Cerca su internet per i dettagli specifici — niente generico.

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
- "daMin" è il minuto dall'inizio della visita in cui quel punto ha senso, calibrato sulla
  durata indicata: l'ultimo punto deve stare ragionevolmente entro la durata data.
- Ogni punto deve poter essere letto in 20-30 secondi mentre si è in piedi davanti alla cosa.
- Zero generico: non "ammira gli affreschi", ma cosa raffigurano e dove guardare esattamente.`;

const STRUMENTI = [{
  function_declarations: [
    {
      name: 'cerca_catalogo',
      description: 'Cerca attività già schedate in una tappa, con prezzo, durata, orari, distanza dall\'alloggio e se stanno nel tempo/budget che restano quel giorno.',
      parameters: { type: 'object', properties: { tappaId: { type: 'string' }, data: { type: 'string' }, testo: { type: 'string' }, raggioKm: { type: 'number' } }, required: ['tappaId', 'data'] }
    },
    {
      name: 'leggi_programma',
      description: 'Legge il programma attuale di un giorno dentro una tappa: attività, orari, spesa, margine e rischio.',
      parameters: { type: 'object', properties: { tappaId: { type: 'string' }, data: { type: 'string' } }, required: ['tappaId', 'data'] }
    },
    {
      name: 'aggiungi_tappa',
      description: 'Aggiunge un\'attività al programma di un giorno, nella posizione migliore. Fallisce se non ci sta nel tempo o nel budget.',
      parameters: { type: 'object', properties: { tappaId: { type: 'string' }, data: { type: 'string' }, attivitaId: { type: 'string' } }, required: ['tappaId', 'data', 'attivitaId'] }
    },
    {
      name: 'rimuovi_tappa',
      description: 'Toglie un\'attività dal programma di un giorno.',
      parameters: { type: 'object', properties: { tappaId: { type: 'string' }, data: { type: 'string' }, attivitaId: { type: 'string' } }, required: ['tappaId', 'data', 'attivitaId'] }
    },
    {
      name: 'pianifica_giorno',
      description: 'Costruisce da zero un giorno completo e fattibile dentro una tappa, opzionalmente limitato a un raggio in km dall\'alloggio. Sostituisce il programma esistente di quel giorno.',
      parameters: { type: 'object', properties: { tappaId: { type: 'string' }, data: { type: 'string' }, ritmo: { type: 'string' }, raggioKm: { type: 'number' } }, required: ['tappaId', 'data', 'ritmo'] }
    },
    {
      name: 'ottimizza_percorso',
      description: 'Riordina le attività già nel programma di un giorno per minimizzare il tempo totale di spostamento, senza aggiungerne o toglierne.',
      parameters: { type: 'object', properties: { tappaId: { type: 'string' }, data: { type: 'string' } }, required: ['tappaId', 'data'] }
    },
    {
      name: 'crea_scheda',
      description: 'Crea una scheda nuova per un\'attività non ancora in catalogo, cercandone i dati su internet.',
      parameters: { type: 'object', properties: { tappaId: { type: 'string' }, descrizione: { type: 'string' } }, required: ['tappaId', 'descrizione'] }
    }
  ]
}];

const RUOLO_AGENTE = RUOLO + `

Sei un agente: hai strumenti che leggono e MODIFICANO davvero i programmi dell'app.
Quando l'utente chiede di cambiare una giornata, non descrivere che cosa faresti:
fallo con gli strumenti e poi racconta il risultato in due righe.

Regole di condotta:
- Prima di modificare, leggi (leggi_programma, cerca_catalogo). Non agire alla cieca.
- Usa gli id esatti restituiti dal catalogo, mai nomi inventati.
- Se aggiungi_tappa fallisce per tempo o budget, non insistere: di' che cosa sfora
  e di quanto, e proponi l'alternativa (anche allargare raggioKm se il posto è isolato).
- pianifica_giorno cancella il lavoro già fatto: usalo solo se l'utente lo chiede
  chiaramente o se il giorno è vuoto.
- Alla fine dì sempre come sono cambiati margine, spesa e (se hai ottimizzato) minuti risparmiati.`;

/* ------------------------------------------------------------------ utilità */

const json = (body: unknown, code = 200) =>
  new Response(JSON.stringify(body), { status: code, headers: { ...CORS, 'content-type': 'application/json; charset=utf-8' } });

function estraiJson(testo: string) {
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

const testoDi = (r: any) =>
  (r?.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || '').join('');

const chiamateDi = (r: any) =>
  (r?.candidates?.[0]?.content?.parts || []).filter((p: any) => p.functionCall)
    .map((p: any) => ({ nome: p.functionCall.name, args: p.functionCall.args || {} }));

function fonti(r: any) {
  const chunk = r?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const viste = new Set<string>();
  return chunk.map((c: any) => c.web).filter(Boolean)
    .filter((w: any) => w.uri && !viste.has(w.uri) && viste.add(w.uri))
    .map((w: any) => ({ titolo: w.title || w.uri, url: w.uri }))
    .slice(0, 8);
}

async function gemini(corpo: unknown, stream = false) {
  const url = `${BASE}/${MODELLO}:${stream ? 'streamGenerateContent?alt=sse&' : 'generateContent?'}key=${CHIAVE}`;
  const r = await fetch(url, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo)
  });
  if (!r.ok) {
    const t = await r.text();
    if (r.status === 400 || r.status === 403) throw new Error('Chiave Gemini non valida o senza permessi. Aggiorna il secret GEMINI_API_KEY. Dettaglio: ' + t.slice(0, 200));
    if (r.status === 429) throw new Error('Quota Gemini esaurita per ora: riprova tra qualche minuto.');
    throw new Error('Gemini ha risposto ' + r.status + ': ' + t.slice(0, 300));
  }
  return r;
}

/* ---------------------------------------------------------------- le azioni */

async function scheda(d: any) {
  const contents: any[] = [{
    role: 'user',
    parts: [{
      text: `Tappa: ${d.citta}
Giorno da pianificare: ${d.data}
Alloggio: ${d.alloggio || '(non specificato)'}

Attività da schedare, descritta da me:
"""
${d.descrizione}
"""`
    }]
  }];

  for (let tentativo = 1; tentativo <= 2; tentativo++) {
    const r = await (await gemini({
      contents,
      systemInstruction: { parts: [{ text: RUOLO + '\n\n' + ISTRUZIONI_SCHEDA }] },
      tools: [{ google_search: {} }],
      generationConfig: { temperature: 0.4 }
    })).json();

    const testo = testoDi(r);
    try {
      const s = estraiJson(testo);
      s._fonti = fonti(r);
      return s;
    } catch (err) {
      if (tentativo === 2) throw new Error('Il modello non ha prodotto un JSON valido. Riprova, o compila la scheda a mano.');
      contents.push({ role: 'model', parts: [{ text: testo.slice(0, 2000) }] });
      contents.push({ role: 'user', parts: [{ text: `Errore: ${(err as Error).message}. Rispondi SOLO con l'oggetto JSON, niente altro.` }] });
    }
  }
}

async function approfondimento(d: any) {
  const contents: any[] = [{
    role: 'user',
    parts: [{
      text: `Attività: ${d.nome}\nTappa: ${d.citta}\nPerché vale la visita, dalla nostra scheda: ${d.perche || '—'}\n` +
        `Durata di visita prevista: ${d.durataMin} minuti\n` +
        `Punti già segnalati come da non perdere: ${(d.visita || []).join('; ') || '—'}`
    }]
  }];

  for (let tentativo = 1; tentativo <= 2; tentativo++) {
    const r = await (await gemini({
      contents,
      systemInstruction: { parts: [{ text: RUOLO + '\n\n' + ISTRUZIONI_APPROFONDIMENTO }] },
      tools: [{ google_search: {} }],
      generationConfig: { temperature: 0.5 }
    })).json();

    const testo = testoDi(r);
    try {
      const guida = estraiJson(testo);
      guida._fonti = fonti(r);
      return guida;
    } catch (err) {
      if (tentativo === 2) throw new Error('Il modello non ha prodotto un JSON valido. Riprova tra poco.');
      contents.push({ role: 'model', parts: [{ text: testo.slice(0, 2000) }] });
      contents.push({ role: 'user', parts: [{ text: `Errore: ${(err as Error).message}. Rispondi SOLO con l'oggetto JSON, niente altro.` }] });
    }
  }
}

async function chiedi(d: any) {
  const storico = (d.storico || []).map((m: any) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content || '') }]
  }));

  const risposta = await gemini({
    contents: storico.concat([{
      role: 'user',
      parts: [{ text: `Stato attuale dei miei programmi:\n${d.stato}\n\nDomanda: ${d.domanda}` }]
    }]),
    systemInstruction: { parts: [{ text: RUOLO + '\n\nCONTESTO DEL VIAGGIO\n' + d.contesto }] },
    tools: [{ google_search: {} }],
    generationConfig: { temperature: 0.7 }
  }, true);

  const { readable, writable } = new TransformStream();
  (async () => {
    const w = writable.getWriter(), enc = new TextEncoder(), dec = new TextDecoder();
    const rd = risposta.body!.getReader();
    let resto = '', ultimo: any = null;
    try {
      for (;;) {
        const { done, value } = await rd.read();
        if (done) break;
        resto += dec.decode(value, { stream: true });
        const righe = resto.split('\n'); resto = righe.pop() || '';
        for (const riga of righe) {
          if (!riga.startsWith('data:')) continue;
          const corpo = riga.slice(5).trim();
          if (!corpo || corpo === '[DONE]') continue;
          try {
            const j = JSON.parse(corpo); ultimo = j;
            const t = testoDi(j);
            if (t) await w.write(enc.encode(t));
          } catch { /* frammento parziale: arriva completo al giro dopo */ }
        }
      }
      const f = fonti(ultimo);
      if (f.length) await w.write(enc.encode('\n\nFonti: ' + f.map((x: any) => x.titolo + ' — ' + x.url).join(' · ')));
    } catch (e) {
      await w.write(enc.encode('\n\n[Errore: ' + (e as Error).message + ']'));
    }
    await w.close();
  })();

  return new Response(readable, { headers: { ...CORS, 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-cache' } });
}

async function agente(d: any) {
  const r = await (await gemini({
    contents: d.contenuti || [],
    systemInstruction: { parts: [{ text: RUOLO_AGENTE + '\n\nCONTESTO DEL VIAGGIO\n' + d.contesto + '\n\nSTATO ATTUALE\n' + d.stato }] },
    tools: STRUMENTI,
    generationConfig: { temperature: 0.4 }
  })).json();

  const chiamate = chiamateDi(r);
  if (chiamate.length) return { tipo: 'strumenti', chiamate };
  return { tipo: 'testo', testo: testoDi(r) };
}

/* ------------------------------------------------------------------ server */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (!CHIAVE) return json({ errore: 'GEMINI_API_KEY non configurata nei secrets del progetto.' }, 500);
  if (req.method === 'GET') return json({ ok: true, provider: 'gemini', modello: MODELLO, ricercaWeb: true, agente: true });

  try {
    const d = await req.json();
    switch (d.azione) {
      case 'scheda': return json(await scheda(d));
      case 'approfondimento': return json(await approfondimento(d));
      case 'agente': return json(await agente(d));
      case 'chiedi': return await chiedi(d);
      default: return json({ errore: 'azione sconosciuta: ' + d.azione }, 400);
    }
  } catch (err) {
    console.error(err);
    return json({ errore: (err as Error).message || 'errore sconosciuto' }, 500);
  }
});
