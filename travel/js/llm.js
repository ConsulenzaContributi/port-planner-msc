/* ============================================================================
   ASSISTENTE — generalizzazione di js/llm.js (crociera) per il modello
   tappa + giorno. window.APPSTATE.piani è ora chiavizzato "tappaId|data"
   invece di "scaloId", e gli strumenti dell'agente operano su quella chiave.
   ============================================================================ */

(function () {
  const E = window.ENGINE, T = E.T;
  const CHIAVE_CFG = 'travel-llm-cfg';

  const cfg = Object.assign({ proxy: 'http://localhost:8787' }, leggiCfg());
  function leggiCfg() { try { return JSON.parse(localStorage.getItem(CHIAVE_CFG) || '{}'); } catch (e) { return {}; } }
  function salvaCfg() { try { localStorage.setItem(CHIAVE_CFG, JSON.stringify(cfg)); } catch (e) { } }

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  let storico = [];
  let ultimaGenerata = null;
  let modoAgente = true;

  const chiavePiano = (tappaId, data) => tappaId + '|' + data;

  function pianoDi(tappaId, data) {
    const st = window.APPSTATE, k = chiavePiano(tappaId, data);
    if (!st.piani[k]) st.piani[k] = { tappaId: tappaId, data: data, ritmo: 'medio', items: [] };
    if (!st.piani[k].ritmo) st.piani[k].ritmo = 'medio';
    return st.piani[k];
  }

  /* ======================================================= contesto per l'LLM */

  function contestoStabile() {
    const righe = window.VIAGGIO.tappe.map(function (t) {
      const giorniTxt = t.giorni.map(g => g.data + ' (' + GIORNI[g.giornoSettimana] + ')').join(', ');
      return `Tappa "${t.id}" — ${t.citta}: ${t.dataInizio} → ${t.dataFine} (${t.notti} notti). ` +
        `Alloggio: ${t.alloggio.nome} [${t.alloggio.coord[0]},${t.alloggio.coord[1]}], check-in ${t.alloggio.checkIn}, check-out ${t.alloggio.checkOut}. ` +
        `Giorni: ${giorniTxt}.` + (t.trasferimento ? ` Arrivo con ${t.trasferimento.modo} (${t.trasferimento.minuti} min) dalla tappa precedente.` : '');
    }).join('\n');

    const catalogo = window.VIAGGIO.tappe.map(function (t) {
      const lista = E.attivitaDiTappa(t.id, true).map(p => {
        const dist = E.km(t.alloggio.coord, p.coord).toFixed(1);
        return `  - [${p.id}] ${p.nome} [${p.cat.join('/')}] ${p.prezzo ? '€' + p.prezzo + '/pp' : 'gratis'}` +
          ` · ${p.durata.medio}min · ${p.orari.da}-${p.orari.a} · ${dist}km dall'alloggio` +
          (p.chiusoGiorni && p.chiusoGiorni.length ? ` · chiuso ${p.chiusoGiorni.map(g => GIORNI[g]).join(',')}` : '') +
          (p.slot ? ' · slot orario' : '');
      }).join('\n');
      return `${t.citta} (tappa "${t.id}"):\n${lista}`;
    }).join('\n\n');

    return `VIAGGIO: ${window.VIAGGIO.nome}, ${window.VIAGGIO.dataPartenza} → ${window.VIAGGIO.dataArrivo}, ${window.VIAGGIO.viaggiatori} viaggiatori.\n\n` +
      `TAPPE\n${righe}\n\nCATALOGO ATTIVITÀ\n${catalogo}\n\n` +
      `Budget: ${window.VIAGGIO.budgetPerPersonaGiorno} € a persona al giorno (${E.budgetGiorno()} € totali al giorno).`;
  }

  function riassuntoPiano(tappa, data) {
    const p = pianoDi(tappa.id, data);
    if (!p.items.length) return { tappa: tappa.citta, data: data, ritmo: p.ritmo, attivita: [], nota: 'giornata vuota' };
    const v = E.valuta(p);
    return {
      tappa: tappa.citta, data: data, ritmo: p.ritmo,
      attivita: v.steps.filter(x => x.tipo === 'visit').map(x => ({
        id: x.poi.id, nome: x.poi.nome,
        dalle: T.hhmm(x.inizio), alle: T.hhmm(x.inizio + x.min), prezzoPP: x.poi.prezzo || 0
      })),
      rientro: T.hhmm(v.fine),
      margineMin: v.bufferMin, margineMinimoRichiestoMin: v.bufferReq,
      spesaGiorno: v.costo, budgetGiorno: v.budget,
      rischio: v.rischio, fattibile: !!v.fattibile
    };
  }

  function statoAttuale() {
    const righe = [];
    window.VIAGGIO.tappe.forEach(function (t) {
      t.giorni.forEach(function (g) {
        const k = chiavePiano(t.id, g.data);
        const p = window.APPSTATE.piani[k];
        if (!p || !p.items.length) { righe.push(`${t.citta} ${g.data}: nessun programma`); return; }
        const r = riassuntoPiano(t, g.data);
        const elenco = r.attivita.map(a => `${a.dalle}-${a.alle} ${a.nome}`).join('; ');
        righe.push(`${t.citta} ${g.data} (ritmo ${r.ritmo}): ${elenco} → rientro ${r.rientro}, ` +
          `margine ${T.dur(r.margineMin)} (minimo ${T.dur(r.margineMinimoRichiestoMin)}), ` +
          `spesa €${r.spesaGiorno} su €${r.budgetGiorno}, rischio ${r.rischio}`);
      });
    });
    const st = window.APPSTATE;
    return righe.join('\n') + `\n\nGiornata attualmente aperta nell'app: ${st.tappaId} / ${st.data}.`;
  }

  /* ============================================================ chiamate HTTP */

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

  async function apiScheda(descrizione, tappa) {
    const r = await chiama('scheda', {
      descrizione: descrizione, citta: tappa.citta, data: window.APPSTATE.data,
      alloggio: tappa.alloggio.nome
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.errore || 'errore del proxy');
    return j;
  }

  async function apiApprofondimento(poi, tappa) {
    const r = await chiama('approfondimento', {
      nome: poi.nome, citta: tappa.citta, perche: poi.perche,
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

  /* ============================================ conversione scheda → attività */

  function inAttivita(s, tappaId) {
    const base = (s.nome || 'attivita').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28);
    let id = 'mia-' + base, n = 2;
    while (E.getAttivita(id)) id = 'mia-' + base + '-' + (n++);
    return {
      id: id, nome: s.nome, tappa: tappaId, custom: true,
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
      fatica: { km: Number(s.faticaKm) || 0, gradini: +s.faticaGradini || 0 },
      quando: s.quando || 'qualsiasi', perche: s.perche || '',
      visita: s.visita || [], tips: s.tips || [], wc: s.wc || '—',
      fonti: Array.isArray(s._fonti) ? s._fonti : [],
      immagine: s.immagineUrl ? { url: s.immagineUrl, credito: s.immagineCredito || 'fonte web' } : null,
      verificato: new Date().toISOString().slice(0, 10), daVerificare: true
    };
  }

  function risolviTappa(id) {
    const n = String(id || '').toLowerCase().trim();
    return window.VIAGGIO.tappe.find(t => t.id === n) || window.VIAGGIO.tappe.find(t => t.citta.toLowerCase() === n) || null;
  }

  /* ============================================== strumenti dell'agente */

  const STRUMENTI = {
    cerca_catalogo: function (a) {
      const t = risolviTappa(a.tappaId); if (!t) return { errore: 'tappa sconosciuta: ' + a.tappaId };
      const q = String(a.testo || '').toLowerCase();
      const p = pianoDi(t.id, a.data);
      return {
        tappa: t.citta,
        attivita: E.candidati(p, { includiFuoriScope: window.APPSTATE.fuoriScope, raggioKm: a.raggioKm })
          .filter(c => !q || (c.poi.nome + ' ' + c.poi.cat.join(' ')).toLowerCase().indexOf(q) >= 0)
          .slice(0, 40)
          .map(c => ({
            id: c.poi.id, nome: c.poi.nome, cat: c.poi.cat, stelle: c.poi.top,
            prezzoPP: c.poi.prezzo || 0, orari: c.poi.orari.da + '-' + c.poi.orari.a,
            distanzaKm: +c.distanzaKm.toFixed(2),
            costoInserimentoMin: c.dMin, costoInserimentoEur: c.dEur,
            ciSta: !!c.fattibile, perchéNo: c.escluso || null
          }))
      };
    },
    leggi_programma: function (a) {
      const t = risolviTappa(a.tappaId); if (!t) return { errore: 'tappa sconosciuta: ' + a.tappaId };
      return riassuntoPiano(t, a.data);
    },
    aggiungi_tappa: function (a) {
      const t = risolviTappa(a.tappaId); if (!t) return { errore: 'tappa sconosciuta: ' + a.tappaId };
      const poi = E.getAttivita(a.attivitaId);
      if (!poi) return { errore: 'id inesistente: ' + a.attivitaId + '. Usa cerca_catalogo per gli id veri.' };
      const p = pianoDi(t.id, a.data);
      if (p.items.some(i => i.attivitaId === a.attivitaId)) return { errore: 'già in programma' };
      const ins = E.miglioreInserimento(p, a.attivitaId);
      if (!ins.fattibile) return { fatto: false, motivo: 'non ci sta nel tempo o nel budget', dopo: riassuntoPiano(t, a.data) };
      p.items.splice(ins.indice, 0, { attivitaId: a.attivitaId });
      return { fatto: true, aggiunta: poi.nome, dopo: riassuntoPiano(t, a.data) };
    },
    rimuovi_tappa: function (a) {
      const t = risolviTappa(a.tappaId); if (!t) return { errore: 'tappa sconosciuta: ' + a.tappaId };
      const p = pianoDi(t.id, a.data), prima = p.items.length;
      p.items = p.items.filter(i => i.attivitaId !== a.attivitaId);
      return { fatto: p.items.length < prima, dopo: riassuntoPiano(t, a.data) };
    },
    pianifica_giorno: function (a) {
      const t = risolviTappa(a.tappaId); if (!t) return { errore: 'tappa sconosciuta: ' + a.tappaId };
      const ritmo = E.RITMI[a.ritmo] ? a.ritmo : 'medio';
      const st = window.APPSTATE, k = chiavePiano(t.id, a.data);
      st.seme[k] = Math.floor(Math.random() * 1e9);
      st.piani[k] = E.genera(t.id, a.data, ritmo, st.seme[k], { includiFuoriScope: st.fuoriScope, raggioKm: a.raggioKm });
      return { fatto: true, dopo: riassuntoPiano(t, a.data) };
    },
    ottimizza_percorso: function (a) {
      const t = risolviTappa(a.tappaId); if (!t) return { errore: 'tappa sconosciuta: ' + a.tappaId };
      const p = pianoDi(t.id, a.data);
      const r = E.ottimizzaPercorso(p);
      window.APPSTATE.piani[chiavePiano(t.id, a.data)] = r.plan;
      return { fatto: true, risparmioMin: Math.round(r.risparmioMin), dopo: riassuntoPiano(t, a.data) };
    },
    crea_scheda: async function (a) {
      const t = risolviTappa(a.tappaId); if (!t) return { errore: 'tappa sconosciuta: ' + a.tappaId };
      const poi = inAttivita(await apiScheda(a.descrizione, t), t.id);
      E.registraAttivita(poi);
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
      '<button class="llm-fab" data-llm="tappa" title="Aggiungi un\'attività a questa giornata">＋ Attività</button>' +
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

  function apriTappa() {
    const t = risolviTappa(window.APPSTATE.tappaId);
    if (!t) return;
    const cats = E.CAT.map(c => '<label class="ck"><input type="checkbox" name="cat" value="' + c.id + '"> ' +
      c.icona + ' ' + esc(c.nome) + '</label>').join('');

    box(
      '<header><div><h3>Aggiungi un\'attività a ' + esc(t.citta) + '</h3>' +
        '<p class="mut small">' + esc(window.APPSTATE.data) + '</p></div>' +
        '<button class="x" data-llm="chiudi">✕</button></header>' +
      '<div class="m-tabs">' +
        '<button class="mt on" data-llm="tab" data-t="ai">✨ Descrivi e genera</button>' +
        '<button class="mt" data-llm="tab" data-t="man">Compila a mano</button></div>' +
      '<div class="m-body">' +
        '<div id="tab-ai">' +
          '<p class="mut">Scrivi che cos\'è, anche male. L\'assistente cerca online, compila la scheda completa — ' +
          'orari, prezzi, durate, consigli, fonti — e <b>la aggiunge da sola</b> al catalogo di ' + esc(t.citta) +
          '. Se non ti convince, la togli con un clic.</p>' +
          '<textarea id="ai-desc" rows="4" placeholder="Es: la trattoria vicino all\'alloggio di cui mi ha parlato mio fratello, oppure: il museo di arte moderna"></textarea>' +
          '<div class="riga"><button class="btn primary" data-llm="genera">Genera la scheda</button>' +
          '<span class="mut small">serve il proxy attivo su ' + esc(cfg.proxy) + '</span></div>' +
          '<div id="ai-out"></div>' +
        '</div>' +
        '<div id="tab-man" hidden>' +
          '<div class="form">' +
            '<label>Nome<input id="m-nome" placeholder="Nome dell\'attività"></label>' +
            '<label>Perché vale<textarea id="m-perche" rows="2" placeholder="Due righe sul perché ci vuoi andare"></textarea></label>' +
            '<div class="due">' +
              '<label>Latitudine<input id="m-lat" type="number" step="0.0001" placeholder="' + t.alloggio.coord[0].toFixed(4) + '"></label>' +
              '<label>Longitudine<input id="m-lng" type="number" step="0.0001" placeholder="' + t.alloggio.coord[1].toFixed(4) + '"></label>' +
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
    const t = risolviTappa(window.APPSTATE.tappaId);
    const desc = document.getElementById('ai-desc').value.trim();
    const out = document.getElementById('ai-out');
    if (!desc) { out.innerHTML = '<p class="av err">Scrivi almeno due parole.</p>'; return; }
    if (ultimaGenerata) { E.eliminaAttivita(ultimaGenerata); ultimaGenerata = null; }
    out.innerHTML = '<p class="attesa">Cerco su internet e compilo la scheda… (15-40 secondi)</p>';
    try {
      const scheda = await apiScheda(desc, t);
      const poi = inAttivita(scheda, t.id);
      E.registraAttivita(poi);
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
    const t = risolviTappa(window.APPSTATE.tappaId);
    return '<div class="prev"><p class="av ok">✓ <b>' + esc(p.nome) + '</b> è già nel catalogo di ' +
      esc(t.citta) + '.</p>' +
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
        '<div class="kv-r"><span>Distanza dall\'alloggio</span><div>' + E.km(t.alloggio.coord, p.coord).toFixed(1) + ' km</div></div>' +
        (p.prenota ? '<div class="kv-r"><span>Prenotazione</span><div>' +
          (p.prenota.url ? '<a href="' + esc(p.prenota.url) + '" target="_blank" rel="noopener">' + esc(p.prenota.url) + '</a><br>' : '') +
          esc(p.prenota.note) + '</div></div>' : '') +
      '</div>' +
      (p.visita.length ? '<h4>Da non perdere</h4><ul class="tips">' + p.visita.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
      (p.tips.length ? '<h4>Consigli</h4><ul class="tips">' + p.tips.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
      (p.fonti && p.fonti.length
        ? '<h4>Fonti consultate</h4><ul class="tips">' + p.fonti.map(f =>
            '<li><a href="' + esc(f.url) + '" target="_blank" rel="noopener">' + esc(f.titolo) + '</a></li>').join('') + '</ul>'
        : '<p class="av warn">Nessuna fonte web: questi dati vengono dalla memoria del modello, non da una pagina. Controllali tutti.</p>') +
      '<p class="av warn">⚠️ Scheda compilata da un modello: <b>verifica orari, prezzi e coordinate</b> prima di fidarti.</p>' +
      '<div class="riga"><button class="btn ghost" data-llm="annulla">Annulla, toglila</button>' +
      '<button class="btn ghost" data-llm="genera">Rifalla</button>' +
      '<button class="btn primary" data-llm="chiudi">Fatto</button></div></div>';
  }

  function salvaManuale() {
    const g = id => document.getElementById(id).value.trim();
    const nome = g('m-nome');
    if (!nome) return alert('Serve almeno il nome.');
    const lat = parseFloat(g('m-lat')), lng = parseFloat(g('m-lng'));
    const t = risolviTappa(window.APPSTATE.tappaId);
    const dur = parseInt(g('m-dur'), 10) || 45;
    const cat = Array.from(document.querySelectorAll('#tab-man input[name=cat]:checked')).map(x => x.value);
    const poi = inAttivita({
      nome: nome, cat: cat.length ? cat : ['esperienze'],
      lat: isNaN(lat) ? t.alloggio.coord[0] : lat,
      lng: isNaN(lng) ? t.alloggio.coord[1] : lng,
      top: parseInt(g('m-top'), 10),
      durataVeloce: Math.round(dur * 0.7), durataMedio: dur, durataLento: Math.round(dur * 1.4),
      prezzo: parseFloat(g('m-prezzo')) || 0, prezzoNote: 'Inserito a mano.',
      orariDa: g('m-da') || '00:00', orariA: g('m-a') || '23:59',
      chiusoGiorni: [], slot: false, prenotaUrl: '', prenotaAnticipoGiorni: 0, prenotaNote: '',
      saltafila: '', codaTipica: 0, codaPunta: 0,
      faticaKm: 0.3, faticaGradini: 0,
      quando: 'qualsiasi', perche: g('m-perche') || 'Aggiunta da me.',
      visita: [], tips: [], wc: '—'
    }, t.id);
    conferma(poi);
  }

  function conferma(poi) {
    E.registraAttivita(poi);
    chiudi();
    if (window.APPRENDER) window.APPRENDER();
    setTimeout(() => alert('«' + poi.nome + '» aggiunta al catalogo di ' +
      risolviTappa(window.APPSTATE.tappaId).citta + '. La trovi tra le attività disponibili.'), 60);
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
            ['Riempimi la giornata di oggi con ritmo medio e dimmi che margine resta',
             'Ottimizza il percorso di oggi per camminare meno',
             'Cosa c\'è di interessante entro 1 km dall\'alloggio?',
             'Suggeriscimi dove pranzare vicino alla prossima attività']
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

  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-llm]');
    if (!el) return;
    if (el.getAttribute('data-llm') === 'agente') { modoAgente = el.checked; return; }
    e.preventDefault(); e.stopPropagation();
    switch (el.getAttribute('data-llm')) {
      case 'tappa': apriTappa(); break;
      case 'chat': apriChat(); break;
      case 'chiudi': chiudi(); break;
      case 'genera': genera(); break;
      case 'conferma': if (el._poi) conferma(el._poi); break;
      case 'annulla':
        if (el._poi) { E.eliminaAttivita(el._poi.id); ultimaGenerata = null; if (window.APPRENDER) window.APPRENDER(); chiudi(); }
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

  window.LLM_pianoDi = pianoDi;
  window.LLM_chiavePiano = chiavePiano;
  window.LLM_risolviTappa = risolviTappa;

  barra();
})();
