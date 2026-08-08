/* ============================================================================
   ASSISTENTE — aggiunta automatica di tappe, domande, e agente che agisce.

   La chiave API non sta qui. Questo file parla solo con il proxy locale
   (server/llm-proxy.mjs), che a sua volta parla con Google Gemini — che ha la
   ricerca web, quindi orari e prezzi vengono da pagine vere, con le fonti.
   Se il proxy non gira, l'aggiunta manuale funziona lo stesso.
   ============================================================================ */

(function () {
  const E = window.ENGINE, T = E.T;
  const CHIAVE_CFG = 'crociera-llm-cfg';

  const cfg = Object.assign({ proxy: 'http://localhost:8787' }, leggiCfg());
  function leggiCfg() { try { return JSON.parse(localStorage.getItem(CHIAVE_CFG) || '{}'); } catch (e) { return {}; } }
  function salvaCfg() { try { localStorage.setItem(CHIAVE_CFG, JSON.stringify(cfg)); } catch (e) { } }

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  let storico = [];
  let ultimaGenerata = null;   /* id dell'ultima scheda auto-compilata, per «Annulla» */
  let modoAgente = true;       /* l'assistente può agire, non solo rispondere */

  /* ======================================================= contesto per l'LLM */

  /* Stabile a ogni richiesta → va nel system prompt, dove viene messo in cache.
     Nessuna data di generazione, nessun contatore: un solo byte diverso e la
     cache salta. */
  function contestoStabile() {
    const righe = CRUISE.scali.map(function (s) {
      if (s.tipo === 'mare') return `G${s.giorno} ${s.data} — giorno di navigazione`;
      const f = E.finestra(s);
      return `G${s.giorno} ${s.data} (${GIORNI[s.giornoSettimana]}) — ${s.citta}` +
        ` · sbarco ${s.arrivo || '—'} · tutti a bordo ${T.hhmm(f.allAboard)}` +
        ` · finestra utile ${T.dur(f.totale)} · accesso: ${s.accesso ? s.accesso.modo : '—'}` +
        (s.accesso && s.accesso.costoAndataRitorno ? ` (€${s.accesso.costoAndataRitorno} a persona A/R)` : '');
    }).join('\n');

    const catalogo = CRUISE.scali.filter(s => s.tipo !== 'mare').map(function (s) {
      const lista = E.poiDiScalo(s.id, true).map(p =>
        `  - ${p.nome} [${p.cat.join('/')}] ${p.prezzo ? '€' + p.prezzo + '/pp' : 'gratis'}` +
        ` · ${p.durata.medio}min · ${p.orari.da}-${p.orari.a}` +
        (p.chiusoGiorni && p.chiusoGiorni.length ? ` · chiuso ${p.chiusoGiorni.map(g => GIORNI[g]).join(',')}` : '') +
        (p.slot ? ' · slot orario' : '') + (p.fuoriScope ? ' · FUORI SCOPE' : '')
      ).join('\n');
      return `${s.citta}:\n${lista}`;
    }).join('\n\n');

    return `ITINERARIO\n${righe}\n\nCATALOGO ATTRAZIONI SCHEDATE\n${catalogo}\n\n` +
      `Budget: ${CRUISE.budgetPerPersona} € a persona per tappa (${E.budgetTotale()} € a coppia).`;
  }

  /* Volatile → va nel turno utente, dopo la cache. */
  function statoAttuale() {
    const st = window.APPSTATE;
    const righe = CRUISE.scali.filter(s => s.tipo !== 'mare').map(function (s) {
      const p = st.piani[s.id];
      if (!p || !p.items.length) return `${s.citta}: nessun programma`;
      const v = E.valuta(p);
      const tappe = v.steps.filter(x => x.tipo === 'visit')
        .map(x => `${T.hhmm(x.inizio)}-${T.hhmm(x.inizio + x.min)} ${x.poi.nome}`).join('; ');
      return `${s.citta} (ritmo ${p.ritmo}): ${tappe}` +
        ` → rientro ${T.hhmm(v.fine)}, margine ${T.dur(v.bufferMin)} (minimo ${T.dur(v.bufferReq)}),` +
        ` spesa €${v.costo} su €${v.budget}, rischio ${v.rischio}`;
    }).join('\n');
    return righe + `\n\nGiornata attualmente aperta nell'app: ${E.getScalo(st.scaloId).citta}.`;
  }

  /* ============================================================ chiamate HTTP

     Un solo punto in cui si decide CON CHI parlare: se hai fatto l'accesso, la
     Edge Function su Supabase (che funziona anche dal telefono); altrimenti il
     proxy su localhost. Le due risposte hanno la stessa forma, quindi da qui in
     giù nessuno deve più saperlo. */

  async function chiama(azione, corpo) {
    if (window.CLOUD && window.CLOUD.chiama) {
      const r = await window.CLOUD.chiama(azione, corpo);
      if (r) return r;
    }
    return fetch(cfg.proxy + '/api/' + azione, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(corpo)
    });
  }

  async function apiScheda(descrizione, scalo) {
    const f = E.finestra(scalo);
    const r = await chiama('scheda', {
      descrizione: descrizione, citta: scalo.citta, data: scalo.data,
      giorno: GIORNI[scalo.giornoSettimana],
      finestra: `${T.hhmm(f.inizio)}–${T.hhmm(f.allAboard)} (${T.dur(f.totale)})`
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.errore || 'errore del proxy');
    return j;
  }

  async function apiApprofondimento(poi, scalo) {
    const r = await chiama('approfondimento', {
      nome: poi.nome, citta: scalo.citta, perche: poi.perche,
      durataMin: poi.durata.medio, visita: poi.visita || []
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.errore || 'errore del proxy');
    return j;
  }
  window.LLM_apiApprofondimento = apiApprofondimento;

  async function apiChiedi(domanda, onTesto) {
    const r = await chiama('chiedi', {
      domanda: domanda, contesto: contestoStabile(), stato: statoAttuale(),
      storico: storico.slice(-8)
    });
    if (!r.ok) throw new Error('l\'assistente ha risposto ' + r.status);
    const reader = r.body.getReader(), dec = new TextDecoder();
    let tutto = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      const pezzo = dec.decode(value, { stream: true });
      tutto += pezzo; onTesto(tutto);
    }
    return tutto;
  }

  /* ============================================ conversione scheda → POI app */

  function inPoi(s, scaloId) {
    const base = (s.nome || 'tappa').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28);
    let id = 'mio-' + base, n = 2;
    while (E.getPoi(id)) id = 'mio-' + base + '-' + (n++);
    return {
      id: id, nome: s.nome, scalo: E.chiave(scaloId), custom: true,
      cat: (s.cat && s.cat.length ? s.cat : ['esperienze']).slice(0, 3),
      coord: [Number(s.lat), Number(s.lng)], top: Number(s.top) || 3,
      durata: { veloce: +s.durataVeloce || 30, medio: +s.durataMedio || 45, lento: +s.durataLento || 70 },
      prezzo: Number(s.prezzo) || 0, prezzoNote: s.prezzoNote || '',
      orari: { da: s.orariDa || '00:00', a: s.orariA || '23:59' },
      chiusoGiorni: s.chiusoGiorni || [], slot: !!s.slot,
      prenota: (s.prenotaUrl || s.prenotaNote)
        ? { url: s.prenotaUrl || null, anticipoGiorni: +s.prenotaAnticipoGiorni || 0, note: s.prenotaNote || '' }
        : null,
      saltafila: s.saltafila || null,
      coda: { tipica: +s.codaTipica || 0, punta: +s.codaPunta || 0 },
      fatica: { km: Number(s.faticaKm) || 0, gradini: +s.faticaGradini || 0, ombra: s.faticaOmbra || 'parziale' },
      quando: s.quando || 'qualsiasi', perche: s.perche || '',
      visita: s.visita || [], tips: s.tips || [], wc: s.wc || '—',
      fonti: Array.isArray(s._fonti) ? s._fonti : [],
      immagine: s.immagineUrl ? { url: s.immagineUrl, credito: s.immagineCredito || 'fonte web' } : null,
      verificato: new Date().toISOString().slice(0, 10), daVerificare: true
    };
  }

  /* Il modello dice "palermo" o "Palermo": qui diventa un id di scalo vero. */
  function risolviScalo(nome) {
    const n = String(nome || '').toLowerCase().trim();
    const scali = CRUISE.scali.filter(s => s.tipo !== 'mare');
    return scali.find(s => s.id === n)
      || scali.find(s => E.chiave(s.id) === n)
      || scali.find(s => s.citta.toLowerCase() === n)
      || scali.find(s => s.id.indexOf(n) === 0 || n.indexOf(E.chiave(s.id)) === 0)
      || null;
  }

  /* ============================================== strumenti dell'agente

     Il proxy decide QUALE strumento chiamare; l'esecuzione avviene qui, dove
     stanno il motore e i programmi. Ogni strumento restituisce dati compatti:
     l'agente non deve leggere tutto il catalogo per rispondere a una domanda. */

  function pianoDi(scaloId) {
    const st = window.APPSTATE;
    if (!st.piani[scaloId]) st.piani[scaloId] = { scaloId: scaloId, ritmo: 'medio', items: [] };
    if (!st.piani[scaloId].ritmo) st.piani[scaloId].ritmo = 'medio';
    return st.piani[scaloId];
  }

  function riassuntoPiano(s) {
    const p = pianoDi(s.id);
    if (!p.items.length) return { citta: s.citta, ritmo: p.ritmo, tappe: [], nota: 'giornata vuota' };
    const v = E.valuta(p);
    return {
      citta: s.citta, ritmo: p.ritmo,
      tappe: v.steps.filter(x => x.tipo === 'visit').map(x => ({
        id: x.poi.id, nome: x.poi.nome,
        dalle: T.hhmm(x.inizio), alle: T.hhmm(x.inizio + x.min), prezzoPP: x.poi.prezzo || 0
      })),
      rientroABordo: T.hhmm(v.fine),
      margineMin: v.bufferMin, margineMinimoRichiestoMin: v.bufferReq,
      spesaCoppia: v.costo, budgetCoppia: v.budget,
      rischio: v.rischio, fattibile: !!v.fattibile
    };
  }

  const STRUMENTI = {
    cerca_catalogo: function (a) {
      const s = risolviScalo(a.scalo); if (!s) return { errore: 'scalo sconosciuto: ' + a.scalo };
      const q = String(a.testo || '').toLowerCase();
      const p = pianoDi(s.id);
      return {
        citta: s.citta,
        attrazioni: E.candidati(p, { includiFuoriScope: window.APPSTATE.fuoriScope })
          .filter(c => !q || (c.poi.nome + ' ' + c.poi.cat.join(' ')).toLowerCase().indexOf(q) >= 0)
          .slice(0, 40)
          .map(c => ({
            id: c.poi.id, nome: c.poi.nome, cat: c.poi.cat, stelle: c.poi.top,
            prezzoPP: c.poi.prezzo || 0, orari: c.poi.orari.da + '-' + c.poi.orari.a,
            costoInserimentoMin: c.dMin, costoInserimentoEur: c.dEur,
            ciSta: !!c.fattibile, perchéNo: c.escluso || null
          }))
      };
    },
    leggi_programma: function (a) {
      const s = risolviScalo(a.scalo); if (!s) return { errore: 'scalo sconosciuto: ' + a.scalo };
      return riassuntoPiano(s);
    },
    aggiungi_tappa: function (a) {
      const s = risolviScalo(a.scalo); if (!s) return { errore: 'scalo sconosciuto: ' + a.scalo };
      const poi = E.getPoi(a.poiId);
      if (!poi) return { errore: 'id inesistente: ' + a.poiId + '. Usa cerca_catalogo per gli id veri.' };
      const p = pianoDi(s.id);
      if (p.items.some(i => i.poiId === a.poiId)) return { errore: 'già in programma' };
      const ins = E.miglioreInserimento(p, a.poiId);
      if (!ins.fattibile) return { fatto: false, motivo: ins.motivo || 'non ci sta nel tempo o nel budget', dopo: riassuntoPiano(s) };
      p.items.splice(ins.indice, 0, { poiId: a.poiId });
      return { fatto: true, aggiunta: poi.nome, dopo: riassuntoPiano(s) };
    },
    rimuovi_tappa: function (a) {
      const s = risolviScalo(a.scalo); if (!s) return { errore: 'scalo sconosciuto: ' + a.scalo };
      const p = pianoDi(s.id), prima = p.items.length;
      p.items = p.items.filter(i => i.poiId !== a.poiId);
      return { fatto: p.items.length < prima, dopo: riassuntoPiano(s) };
    },
    genera_programma: function (a) {
      const s = risolviScalo(a.scalo); if (!s) return { errore: 'scalo sconosciuto: ' + a.scalo };
      const ritmo = E.RITMI[a.ritmo] ? a.ritmo : 'medio';
      const st = window.APPSTATE;
      st.seme[s.id] = Math.floor(Math.random() * 1e9);
      st.piani[s.id] = E.genera(s.id, ritmo, st.seme[s.id], { includiFuoriScope: st.fuoriScope });
      return { fatto: true, dopo: riassuntoPiano(s) };
    },
    crea_scheda: async function (a) {
      const s = risolviScalo(a.scalo); if (!s) return { errore: 'scalo sconosciuto: ' + a.scalo };
      const poi = inPoi(await apiScheda(a.descrizione, s), s.id);
      E.registraPoi(poi);
      return { fatto: true, id: poi.id, nome: poi.nome, prezzoPP: poi.prezzo, durataMedioMin: poi.durata.medio, daVerificare: true };
    }
  };

  async function eseguiStrumento(c) {
    try {
      const f = STRUMENTI[c.nome];
      if (!f) return { errore: 'strumento sconosciuto' };
      return await f(c.args || {});
    } catch (err) { return { errore: err.message }; }
  }

  /* Un giro = una chiamata al proxy. Il limite di 6 evita che un modello
     confuso resti a girare a vuoto sui programmi veri. */
  async function agente(domanda, onStato) {
    const contenuti = storico.slice(-8).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }]
    }));
    contenuti.push({ role: 'user', parts: [{ text: domanda }] });

    for (let giro = 0; giro < 6; giro++) {
      const r = await chiama('agente', {
        contesto: contestoStabile(), stato: statoAttuale(), contenuti: contenuti
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.errore || 'errore dell\'assistente');
      if (j.tipo === 'testo') return j.testo;

      contenuti.push({ role: 'model', parts: j.chiamate.map(c => ({ functionCall: { name: c.nome, args: c.args } })) });
      const risposte = [];
      for (const c of j.chiamate) {
        onStato('⚙️ ' + c.nome.replace(/_/g, ' ') + '…');
        const esito = await eseguiStrumento(c);
        risposte.push({ functionResponse: { name: c.nome, response: { esito: esito } } });
      }
      contenuti.push({ role: 'user', parts: risposte });
      if (window.APPRENDER) { window.APPRENDER(); if (window.APPSALVA) window.APPSALVA(); }
    }
    return 'Mi sono fermato dopo sei passaggi per non continuare a modificare i programmi alla cieca. Guarda com\'è ora la giornata e dimmi tu.';
  }

  /* ==================================================================== UI */

  function barra() {
    const b = document.createElement('div');
    b.className = 'llm-bar';
    b.innerHTML =
      '<button class="llm-fab" data-llm="tappa" title="Aggiungi una tappa a questa giornata">＋ Tappa</button>' +
      '<button class="llm-fab primary" data-llm="chat" title="Chiedi qualcosa">💬 Assistente</button>';
    document.body.appendChild(b);
  }

  function box(html, largo) {
    let m = document.getElementById('llm-modal');
    if (!m) { m = document.createElement('div'); m.id = 'llm-modal'; m.className = 'modal'; document.body.appendChild(m); }
    m.innerHTML = '<div class="m-back" data-llm="chiudi"></div><div class="m-box' + (largo ? ' largo' : '') + '">' + html + '</div>';
    m.classList.remove('hidden');
    return m;
  }
  function chiudi() { const m = document.getElementById('llm-modal'); if (m) m.classList.add('hidden'); }

  /* --------------------------------------------------------- aggiungi tappa */

  function apriTappa() {
    const s = E.getScalo(window.APPSTATE.scaloId);
    if (s.tipo === 'mare') return alert('Il giorno di navigazione non ha tappe a terra.');
    const cats = E.CAT.map(c => '<label class="ck"><input type="checkbox" name="cat" value="' + c.id + '"> ' +
      c.icona + ' ' + esc(c.nome) + '</label>').join('');

    box(
      '<header><div><h3>Aggiungi una tappa a ' + esc(s.citta) + '</h3>' +
        '<p class="mut small">' + s.data + ' · ' + GIORNI[s.giornoSettimana] + '</p></div>' +
        '<button class="x" data-llm="chiudi">✕</button></header>' +
      '<div class="m-tabs">' +
        '<button class="mt on" data-llm="tab" data-t="ai">✨ Descrivi e genera</button>' +
        '<button class="mt" data-llm="tab" data-t="man">Compila a mano</button></div>' +
      '<div class="m-body">' +
        '<div id="tab-ai">' +
          '<p class="mut">Scrivi che cos\'è, anche male. L\'assistente cerca online, compila la scheda completa — ' +
          'orari, prezzi, durate, consigli, fonti — e <b>la aggiunge da sola</b> al catalogo di ' + esc(s.citta) +
          '. Se non ti convince, la togli con un clic.</p>' +
          '<textarea id="ai-desc" rows="4" placeholder="Es: la gelateria storica vicino al porto di cui mi ha parlato mio fratello, oppure: il museo del mare"></textarea>' +
          '<div class="riga"><button class="btn primary" data-llm="genera">Genera la scheda</button>' +
          '<span class="mut small">serve il proxy attivo su ' + esc(cfg.proxy) + '</span></div>' +
          '<div id="ai-out"></div>' +
        '</div>' +
        '<div id="tab-man" hidden>' +
          '<div class="form">' +
            '<label>Nome<input id="m-nome" placeholder="Nome dell\'attrazione"></label>' +
            '<label>Perché vale<textarea id="m-perche" rows="2" placeholder="Due righe sul perché ci vuoi andare"></textarea></label>' +
            '<div class="due">' +
              '<label>Latitudine<input id="m-lat" type="number" step="0.0001" placeholder="' + s.ormeggio.coord[0].toFixed(4) + '"></label>' +
              '<label>Longitudine<input id="m-lng" type="number" step="0.0001" placeholder="' + s.ormeggio.coord[1].toFixed(4) + '"></label>' +
            '</div>' +
            '<div class="due">' +
              '<label>Durata visita (min)<input id="m-dur" type="number" value="45"></label>' +
              '<label>Prezzo a persona (€)<input id="m-prezzo" type="number" value="0" step="0.5"></label>' +
            '</div>' +
            '<div class="due">' +
              '<label>Apre<input id="m-da" value="09:00"></label>' +
              '<label>Chiude<input id="m-a" value="18:00"></label>' +
            '</div>' +
            '<label>Quanto vale<select id="m-top">' +
              '<option value="5">★★★★★ imperdibile</option><option value="4">★★★★ molto bella</option>' +
              '<option value="3" selected>★★★ vale una sosta</option><option value="2">★★ se avanza tempo</option>' +
              '<option value="1">★ riempitivo</option></select></label>' +
            '<label>Categorie<div class="cks">' + cats + '</div></label>' +
          '</div>' +
          '<div class="riga"><button class="btn primary" data-llm="salva-man">Aggiungi al catalogo</button></div>' +
        '</div>' +
      '</div>', true);
  }

  async function genera() {
    const s = E.getScalo(window.APPSTATE.scaloId);
    const desc = document.getElementById('ai-desc').value.trim();
    const out = document.getElementById('ai-out');
    if (!desc) { out.innerHTML = '<p class="av err">Scrivi almeno due parole.</p>'; return; }
    /* «Rifalla» non deve lasciare in giro la versione precedente. */
    if (ultimaGenerata) { E.eliminaPoi(ultimaGenerata); ultimaGenerata = null; }
    out.innerHTML = '<p class="attesa">Cerco su internet e compilo la scheda… (15-40 secondi)</p>';
    try {
      const scheda = await apiScheda(desc, s);
      const poi = inPoi(scheda, s.id);
      /* Compilazione automatica: la scheda entra nel catalogo da sola.
         Resta reversibile — sotto c'è «Annulla» — ma non serve confermare. */
      E.registraPoi(poi);
      ultimaGenerata = poi.id;
      if (window.APPRENDER) window.APPRENDER();
      out.innerHTML = anteprima(poi);
      const ann = out.querySelector('[data-llm="annulla"]');
      if (ann) ann._poi = poi;
    } catch (err) {
      out.innerHTML = '<p class="av err">⛔ ' + esc(err.message) + '</p>' +
        '<p class="mut small">Il proxy risponde su ' + esc(cfg.proxy) + '? Avvialo con ' +
        '<code>cd server && npm install && node llm-proxy.mjs</code>, ' +
        'oppure usa la scheda «Compila a mano».</p>';
    }
  }

  function anteprima(p) {
    return '<div class="prev"><p class="av ok">✓ <b>' + esc(p.nome) + '</b> è già nel catalogo di ' +
      esc(E.getScalo(window.APPSTATE.scaloId).citta) + '.</p>' +
      (p.immagine && p.immagine.url
        ? '<div class="p-img"><img src="' + esc(p.immagine.url) + '" alt="' + esc(p.nome) + '" loading="lazy" onerror="this.parentElement.remove()">' +
          (p.immagine.credito ? '<span class="p-img-c">' + esc(p.immagine.credito) + '</span>' : '') + '</div>'
        : '') +
      '<h4>' + esc(p.nome) + ' <span class="stars">' + '★'.repeat(p.top) + '</span></h4>' +
      '<div class="p-tags">' + p.cat.map(function (c) {
        const i = E.CAT.find(x => x.id === c) || { icona: '•', nome: c, colore: '#888' };
        return '<span class="tg" style="--c:' + i.colore + '">' + i.icona + ' ' + esc(i.nome) + '</span>';
      }).join('') + '</div>' +
      '<p>' + esc(p.perche) + '</p>' +
      '<div class="kv">' +
        '<div class="kv-r"><span>Durata</span><div>' + p.durata.veloce + ' / ' + p.durata.medio + ' / ' + p.durata.lento + ' min</div></div>' +
        '<div class="kv-r"><span>Prezzo</span><div>' + (p.prezzo ? '€ ' + p.prezzo + ' a persona' : 'Gratuito') + ' — ' + esc(p.prezzoNote) + '</div></div>' +
        '<div class="kv-r"><span>Orari</span><div>' + esc(p.orari.da + ' – ' + p.orari.a) +
          (p.chiusoGiorni.length ? ' · chiuso ' + p.chiusoGiorni.map(g => GIORNI[g]).join(', ') : '') +
          (p.slot ? ' · <b>slot orario</b>' : '') + '</div></div>' +
        (p.prenota ? '<div class="kv-r"><span>Prenotazione</span><div>' +
          (p.prenota.url ? '<a href="' + esc(p.prenota.url) + '" target="_blank" rel="noopener">' + esc(p.prenota.url) + '</a><br>' : '') +
          esc(p.prenota.note) + '</div></div>' : '') +
        '<div class="kv-r"><span>Coordinate</span><div>' + p.coord[0].toFixed(4) + ', ' + p.coord[1].toFixed(4) + '</div></div>' +
      '</div>' +
      (p.visita.length ? '<h4>Da non perdere</h4><ul class="tips">' + p.visita.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
      (p.tips.length ? '<h4>Consigli</h4><ul class="tips">' + p.tips.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
      (p.fonti && p.fonti.length
        ? '<h4>Fonti consultate</h4><ul class="tips">' + p.fonti.map(f =>
            '<li><a href="' + esc(f.url) + '" target="_blank" rel="noopener">' + esc(f.titolo) + '</a></li>').join('') + '</ul>'
        : '<p class="av warn">Nessuna fonte web: questi dati vengono dalla memoria del modello, non da una pagina. Controllali tutti.</p>') +
      '<p class="av warn">⚠️ Scheda compilata da un modello: <b>verifica orari, prezzi e coordinate</b> prima di fidarti. ' +
      'Nel catalogo resta marcata «da verificare».</p>' +
      '<div class="riga"><button class="btn ghost" data-llm="annulla">Annulla, toglila</button>' +
      '<button class="btn ghost" data-llm="genera">Rifalla</button>' +
      '<button class="btn primary" data-llm="chiudi">Fatto</button></div></div>';
  }

  function salvaManuale() {
    const g = id => document.getElementById(id).value.trim();
    const nome = g('m-nome');
    if (!nome) return alert('Serve almeno il nome.');
    const lat = parseFloat(g('m-lat')), lng = parseFloat(g('m-lng'));
    const s = E.getScalo(window.APPSTATE.scaloId);
    const dur = parseInt(g('m-dur'), 10) || 45;
    const cat = Array.from(document.querySelectorAll('#tab-man input[name=cat]:checked')).map(x => x.value);
    const poi = inPoi({
      nome: nome, cat: cat.length ? cat : ['esperienze'],
      lat: isNaN(lat) ? s.ormeggio.coord[0] : lat,
      lng: isNaN(lng) ? s.ormeggio.coord[1] : lng,
      top: parseInt(g('m-top'), 10),
      durataVeloce: Math.round(dur * 0.7), durataMedio: dur, durataLento: Math.round(dur * 1.4),
      prezzo: parseFloat(g('m-prezzo')) || 0, prezzoNote: 'Inserito a mano.',
      orariDa: g('m-da') || '00:00', orariA: g('m-a') || '23:59',
      chiusoGiorni: [], slot: false, prenotaUrl: '', prenotaAnticipoGiorni: 0, prenotaNote: '',
      saltafila: '', codaTipica: 0, codaPunta: 0,
      faticaKm: 0.3, faticaGradini: 0, faticaOmbra: 'parziale',
      quando: 'qualsiasi', perche: g('m-perche') || 'Aggiunta da me.',
      visita: [], tips: [], wc: '—'
    }, s.id);
    conferma(poi);
  }

  function conferma(poi) {
    E.registraPoi(poi);
    chiudi();
    if (window.APPRENDER) window.APPRENDER();
    setTimeout(() => alert('«' + poi.nome + '» aggiunta al catalogo di ' +
      E.getScalo(window.APPSTATE.scaloId).citta + '. La trovi tra le attrazioni disponibili.'), 60);
  }

  /* ------------------------------------------------------------------ chat */

  function apriChat() {
    box(
      '<header><div><h3>💬 Assistente di viaggio</h3>' +
        '<p class="mut small">Conosce l\'itinerario, le schede e i tuoi programmi. Cerca su internet quando servono prezzi e orari.</p></div>' +
        '<button class="x" data-llm="chiudi">✕</button></header>' +
      '<div class="m-body chat" id="chat-log">' +
        (storico.length ? storico.map(m =>
          '<div class="msg ' + m.role + '">' + esc(m.content).replace(/\n/g, '<br>') + '</div>').join('')
          : '<div class="sugg"><p class="mut">Prova con:</p>' +
            ['Riempimi la giornata di Palermo con ritmo medio e dimmi che margine resta',
             'A Barcellona togli quello che costa di più e mettici qualcosa di gratis',
             'A che ora devo lasciare la Sagrada Família per essere a bordo in tempo?',
             'Cerca online quanto costa oggi il biglietto del Museo del Bardo a Tunisi']
              .map(q => '<button class="sq" data-llm="chiedi-q">' + esc(q) + '</button>').join('') +
            '</div>') +
      '</div>' +
      '<footer class="chat-in">' +
        '<input id="chat-q" placeholder="Chiedi qualcosa sull\'itinerario, sui tempi, sui costi…">' +
        '<button class="btn primary" data-llm="invia">Invia</button>' +
      '</footer>' +
      '<div class="cfg-riga">' +
      '<label class="ck" title="Se attivo, l\'assistente può davvero aggiungere, togliere e rigenerare le tappe.">' +
      '<input type="checkbox" data-llm="agente"' + (modoAgente ? ' checked' : '') + '> 🤖 può modificare i programmi</label>' +
      '<label>Proxy <input id="cfg-proxy" value="' + esc(cfg.proxy) + '"></label>' +
      '<button class="btn tiny ghost" data-llm="salva-cfg">Salva</button></div>', true);
    const i = document.getElementById('chat-q');
    if (i) { i.focus(); i.addEventListener('keydown', e => { if (e.key === 'Enter') invia(); }); }
  }

  async function invia(testo) {
    const inp = document.getElementById('chat-q');
    const q = (testo || (inp ? inp.value : '')).trim();
    if (!q) return;
    if (inp) inp.value = '';
    const log = document.getElementById('chat-log');
    const sugg = log.querySelector('.sugg'); if (sugg) sugg.remove();

    log.insertAdjacentHTML('beforeend', '<div class="msg user">' + esc(q).replace(/\n/g, '<br>') + '</div>');
    const bolla = document.createElement('div');
    bolla.className = 'msg assistant'; bolla.innerHTML = '<span class="attesa">sto pensando…</span>';
    log.appendChild(bolla); log.scrollTop = log.scrollHeight;

    try {
      const risposta = modoAgente
        ? await agente(q, function (stato) {
            bolla.innerHTML = '<span class="attesa">' + esc(stato) + '</span>';
            log.scrollTop = log.scrollHeight;
          }).then(function (t) { bolla.innerHTML = esc(t).replace(/\n/g, '<br>'); return t; })
        : await apiChiedi(q, function (parziale) {
            bolla.innerHTML = esc(parziale).replace(/\n/g, '<br>');
            log.scrollTop = log.scrollHeight;
          });
      storico.push({ role: 'user', content: q }, { role: 'assistant', content: risposta });
    } catch (err) {
      bolla.className = 'msg err';
      bolla.innerHTML = '⛔ ' + esc(err.message) +
        '<br><span class="mut small">Avvia il proxy: <code>cd server && npm install && node llm-proxy.mjs</code></span>';
    }
    log.scrollTop = log.scrollHeight;
  }

  /* ---------------------------------------------------------------- eventi */

  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-llm]');
    if (!el) return;
    /* La casella dell'agente deve poter cambiare stato: niente preventDefault. */
    if (el.getAttribute('data-llm') === 'agente') { modoAgente = el.checked; return; }
    e.preventDefault(); e.stopPropagation();
    switch (el.getAttribute('data-llm')) {
      case 'tappa': apriTappa(); break;
      case 'chat': apriChat(); break;
      case 'chiudi': chiudi(); break;
      case 'genera': genera(); break;
      case 'conferma': if (el._poi) conferma(el._poi); break;
      case 'annulla':
        if (el._poi) { E.eliminaPoi(el._poi.id); ultimaGenerata = null; if (window.APPRENDER) window.APPRENDER(); chiudi(); }
        break;
      case 'agente':
        modoAgente = el.checked;
        break;
      case 'salva-man': salvaManuale(); break;
      case 'invia': invia(); break;
      case 'chiedi-q': invia(el.textContent); break;
      case 'salva-cfg':
        cfg.proxy = document.getElementById('cfg-proxy').value.trim().replace(/\/$/, '');
        salvaCfg(); el.textContent = 'Salvato ✓'; break;
      case 'tab': {
        const t = el.getAttribute('data-t');
        document.querySelectorAll('#llm-modal .mt').forEach(b => b.classList.toggle('on', b === el));
        document.getElementById('tab-ai').hidden = t !== 'ai';
        document.getElementById('tab-man').hidden = t !== 'man';
        break;
      }
    }
  }, true);

  document.addEventListener('keydown', e => { if (e.key === 'Escape') chiudi(); });

  barra();
})();
