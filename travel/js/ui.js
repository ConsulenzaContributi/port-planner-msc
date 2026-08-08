/* ============================================================================
   INTERFACCIA — generalizzazione di js/ui.js (crociera) per viaggi multi-tappa
   con più giorni per tappa. Niente mappa Leaflet in questa prima versione
   (il motore e i dati sono pronti per aggiungerla seguendo lo stesso pattern
   del progetto crociera: vedi README "Cosa manca ancora").
   ============================================================================ */

(function () {
  const E = window.ENGINE, T = E.T;
  const CHIAVE_STORAGE = 'travel-' + (window.VIAGGIO ? window.VIAGGIO.id : 'default');

  const primaTappa = window.VIAGGIO.tappe[0];
  const state = window.APPSTATE = {
    tappaId: primaTappa.id,
    data: primaTappa.giorni[0].data,
    vista: 'panoramica',
    piani: {},
    fuoriScope: false,
    raggioKm: null,          // idea premium: filtra per distanza dall'alloggio
    seme: {}
  };

  const chiavePiano = (tappaId, data) => tappaId + '|' + data;

  function salva() {
    try {
      localStorage.setItem(CHIAVE_STORAGE, JSON.stringify({
        piani: state.piani, fuoriScope: state.fuoriScope, seme: state.seme, raggioKm: state.raggioKm
      }));
    } catch (e) { /* modalità privata: pazienza */ }
    if (window.CLOUD && window.CLOUD.dopoSalvataggio) window.CLOUD.dopoSalvataggio();
  }
  function carica() {
    try {
      const d = JSON.parse(localStorage.getItem(CHIAVE_STORAGE) || '{}');
      if (d.piani) state.piani = d.piani;
      if (d.seme) state.seme = d.seme;
      state.fuoriScope = !!d.fuoriScope;
      state.raggioKm = d.raggioKm || null;
    } catch (e) { /* niente */ }
  }
  window.APPSALVA = salva;

  function piano(tappaId, data) {
    const k = chiavePiano(tappaId, data);
    if (!state.piani[k]) state.piani[k] = { tappaId: tappaId, data: data, ritmo: 'medio', items: [] };
    if (!state.piani[k].ritmo) state.piani[k].ritmo = 'medio';
    return state.piani[k];
  }

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const eur = n => '€ ' + (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0);
  const catInfo = id => (E.CAT.find(c => c.id === id) || { nome: id, icona: '•', colore: '#888' });
  const GIORNI = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  function dataIt(iso) {
    const d = new Date(iso + 'T12:00:00');
    return GIORNI[d.getDay()] + ' ' + d.getDate() + ' ' +
      ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'][d.getMonth()];
  }
  const pct = (a, b) => Math.max(0, Math.min(100, Math.round(a / b * 100)));

  /* ================================================================ HEADER */
  function renderHeader() {
    const v = window.VIAGGIO;
    document.getElementById('hdr').innerHTML =
      '<div class="hdr-in">' +
        '<div class="hdr-t">' +
          '<h1>' + esc(v.nome) + '</h1>' +
          '<p>' + dataIt(v.dataPartenza) + ' → ' + dataIt(v.dataArrivo) +
            ' · ' + v.tappe.length + ' tappe</p>' +
        '</div>' +
        '<div class="hdr-a">' +
          '<span class="chip">👥 ' + v.viaggiatori + ' persone</span>' +
          '<span class="chip">💶 ' + eur(E.budgetGiorno()) + ' / giorno</span>' +
          '<button class="btn ghost" data-act="budget">💰 Budget</button>' +
          '<button class="btn ghost" data-act="export">Esporta</button>' +
          '<button class="btn ghost" data-act="stampa">Stampa</button>' +
        '</div>' +
      '</div>';
  }

  /* ================================================================== TABS */
  function renderTabs() {
    const html = ['<button class="tab' + (state.vista === 'panoramica' ? ' on' : '') + '" data-act="vista" data-v="panoramica">Panoramica</button>'];
    window.VIAGGIO.tappe.forEach(function (t) {
      t.giorni.forEach(function (g) {
        const on = state.vista === 'giorno' && state.tappaId === t.id && state.data === g.data;
        const p = state.piani[chiavePiano(t.id, g.data)];
        const sem = p && p.items.length ? '<i class="dot ' + E.valuta(p).rischio + '"></i>' : '<i class="dot vuoto"></i>';
        html.push('<button class="tab' + (on ? ' on' : '') + '" data-act="giorno" data-t="' + t.id + '" data-d="' + g.data + '">' +
          sem + '<b>' + esc(t.citta.split(' ')[0]) + '</b> ' + g.data.slice(8, 10) + '/' + g.data.slice(5, 7) + '</button>');
      });
    });
    document.getElementById('tabs').innerHTML = html.join('');
  }

  /* ============================================================ PANORAMICA */
  function renderPanoramica() {
    const cards = [];
    window.VIAGGIO.tappe.forEach(function (t) {
      cards.push('<div class="card tappa-h"><h3>' + (t.bandiera || '📍') + ' ' + esc(t.citta) +
        '</h3><p class="mut">' + esc(t.alloggio.nome) + ' · ' + t.notti + ' notti' +
        (t.trasferimento ? ' · arrivo ' + esc(t.trasferimento.modo) + ' (' + t.trasferimento.minuti + ' min)' : '') + '</p></div>');
      t.giorni.forEach(function (g) {
        const p = state.piani[chiavePiano(t.id, g.data)];
        const v = p && p.items.length ? E.valuta(p) : null;
        const f = E.finestraGiorno(t, g.data);
        cards.push('<div class="card ' + (v ? v.rischio : '') + '" data-act="giorno" data-t="' + t.id + '" data-d="' + g.data + '">' +
          '<div class="card-h"><span class="g">' + g.data.slice(8, 10) + '/' + g.data.slice(5, 7) + '</span>' +
            '<h3>' + esc(t.citta) + '</h3>' +
            (v ? '<span class="pill ' + v.rischio + '">' + (v.rischio === 'verde' ? 'ok' : v.rischio === 'giallo' ? 'stretto' : 'da rivedere') + '</span>' : '') +
          '</div>' +
          '<p class="sub">' + dataIt(g.data) + '</p>' +
          '<p class="orari">' + T.hhmm(f.inizio) + ' → ' + T.hhmm(f.fine) + '</p>' +
          (v
            ? '<div class="mini"><b>' + p.items.length + '</b> attività · <b>' + T.dur(v.tempoUsato) + '</b> impegnate · <b>' + eur(v.costo) + '</b> spesi' +
              '<div class="bars"><div class="bar"><i style="width:' + pct(v.tempoUsato, f.totale) + '%"></i></div>' +
              '<div class="bar euro"><i style="width:' + pct(v.costo, v.budget) + '%"></i></div></div></div>'
            : '<p class="vuoto-msg">Nessun programma. <b>Aprilo e generane uno.</b></p>') +
        '</div>');
      });
    });

    document.getElementById('main').innerHTML =
      '<div class="wrap">' +
        '<div class="intro"><h2>Le tue giornate</h2>' +
        '<p>Ogni giorno ha un tempo chiuso e un budget chiuso. Apri un giorno, scegli un\'attività ' +
        'come ancora e l\'app ti proporrà solo quello che ci sta ancora dentro — vicino all\'alloggio — ' +
        'oppure lascia che generi il percorso da sola.</p></div>' +
        '<div class="grid">' + cards.join('') + '</div>' +
      '</div>';
  }

  /* ================================================================ GIORNO */
  function renderGiorno() {
    const t = window.VIAGGIO.tappe.find(x => x.id === state.tappaId);
    const p = piano(t.id, state.data), v = E.valuta(p), f = E.finestraGiorno(t, state.data);
    const cands = E.candidati(p, { includiFuoriScope: state.fuoriScope, raggioKm: state.raggioKm });

    document.getElementById('main').innerHTML =
      '<div class="wrap giorno">' +
        barra(t, v, f) +
        '<div class="cols">' +
          '<section class="col-plan">' + controlli(t, p, v) + timeline(p, v) + '</section>' +
          '<section class="col-cat">' + catalogo(cands, v) + '</section>' +
        '</div>' +
      '</div>';
  }

  function barra(t, v, f) {
    const tOk = v.tempoResiduo >= 0, cOk = v.costoResiduo >= 0;
    return '<div class="daybar">' +
      '<div class="db-t"><h2>' + (t.bandiera || '📍') + ' ' + esc(t.citta) + '</h2>' +
        '<p>' + dataIt(state.data) + ' · alloggio ' + esc(t.alloggio.nome) + ' · ' +
        '<b class="aab">rientro entro ' + T.hhmm(f.fine) + '</b></p></div>' +
      '<div class="gauges">' +
        '<div class="gauge ' + (tOk ? '' : 'ko') + '">' +
          '<div class="g-h"><span>⏱ Tempo</span><b>' + (tOk ? T.dur(v.tempoResiduo) + ' liberi' : T.dur(-v.tempoResiduo) + ' di troppo') + '</b></div>' +
          '<div class="bar big"><i style="width:' + pct(v.tempoUsato, f.totale) + '%"></i>' +
            '<u style="width:' + pct(v.bufferReq, f.totale) + '%"></u></div>' +
          '<div class="g-f">' + T.dur(v.tempoUsato) + ' impegnate su ' + T.dur(f.totale) + ' · margine di sicurezza ' + T.dur(v.bufferReq) + '</div>' +
        '</div>' +
        '<div class="gauge euro ' + (cOk ? '' : 'ko') + '">' +
          '<div class="g-h"><span>💶 Budget</span><b>' + (cOk ? eur(v.costoResiduo) + ' liberi' : eur(-v.costoResiduo) + ' di troppo') + '</b></div>' +
          '<div class="bar big euro"><i style="width:' + pct(v.costo, v.budget) + '%"></i></div>' +
          '<div class="g-f">' + eur(v.costo) + ' su ' + eur(v.budget) + ' (' + window.VIAGGIO.budgetPersonaGiorno_display() + ')</div>' +
        '</div>' +
      '</div></div>';
  }

  function controlli(t, p, v) {
    const ritmi = Object.keys(E.RITMI).map(id => {
      const r = E.RITMI[id];
      return '<button class="ritmo-btn' + (p.ritmo === id ? ' on' : '') + '" data-act="ritmo" data-r="' + id + '" title="' + esc(r.desc) + '">' +
        r.icona + ' ' + r.nome + '</button>';
    }).join('');
    return '<div class="controlli">' +
      '<div class="riga wrap-riga">' + ritmi + '</div>' +
      '<div class="riga">' +
        '<button class="btn primary" data-act="genera">✨ Genera giornata</button>' +
        '<button class="btn ghost" data-act="ottimizza" title="Riordina le attività scelte per camminare meno">🧭 Ottimizza percorso</button>' +
        '<button class="btn ghost" data-act="pianob" title="Versione ridotta per un imprevisto">Piano B</button>' +
        '<button class="btn ghost" data-act="svuota">Svuota</button>' +
      '</div>' +
      '<div class="riga small-riga">' +
        '<label class="ck">Raggio massimo dall\'alloggio ' +
        '<input type="number" min="0" step="0.5" placeholder="illimitato" value="' + (state.raggioKm || '') + '" data-act="raggio" style="width:5em"> km</label>' +
      '</div>' +
    '</div>';
  }

  function timeline(p, v) {
    if (!p.items.length) return '<div class="empty">Nessuna attività ancora. Scegline una dal catalogo o genera la giornata.</div>';
    const righe = v.steps.map(function (s) {
      if (s.tipo === 'move') return '<div class="step move"><span class="t">' + T.hhmm(s.inizio) + '</span>' +
        '<span class="l">' + (s.modo === 'piedi' ? '🚶' : s.modo === 'mezzi' ? '🚌' : '🚕') + ' ' + T.dur(s.min) +
        (s.km ? ' · ' + s.km.toFixed(1) + ' km' : '') + (s.costo ? ' · ' + eur(s.costo) : '') + '</span></div>';
      if (s.tipo === 'wait') return '<div class="step wait"><span class="t">' + T.hhmm(s.inizio) + '</span><span class="l">⏳ ' + esc(s.titolo) + '</span></div>';
      return '<div class="step visit"><span class="t">' + T.hhmm(s.inizio) + '–' + T.hhmm(s.inizio + s.min) + '</span>' +
        '<span class="l"><b>' + esc(s.poi.nome) + '</b>' +
        '<div class="p-tags mini-tags">' + s.poi.cat.map(c => { const i = catInfo(c); return '<span class="tg" style="--c:' + i.colore + '">' + i.icona + '</span>'; }).join('') + '</div>' +
        (s.costo ? ' · ' + eur(s.costo) : ' · gratis') + '</span>' +
        '<button class="rm" data-act="rimuovi" data-id="' + s.poi.id + '" title="Rimuovi">✕</button></div>';
    }).join('');
    const avvisi = v.avvisi.map(a => '<p class="av ' + a.liv + '">' + (a.liv === 'err' ? '⛔' : a.liv === 'warn' ? '⚠️' : 'ℹ️') + ' ' + esc(a.txt) + '</p>').join('');
    return '<div class="timeline">' + righe + '</div>' + (avvisi ? '<div class="avvisi">' + avvisi + '</div>' : '');
  }

  function catalogo(cands, v) {
    const righe = cands.map(function (c) {
      const p = c.poi;
      const cls = c.fattibile ? 'ok' : 'ko';
      return '<div class="cat-item ' + cls + '" data-act="aggiungi" data-id="' + p.id + '">' +
        '<div class="ci-top"><b>' + esc(p.nome) + '</b> <span class="stars">' + '★'.repeat(p.top) + '</span></div>' +
        '<div class="p-tags">' + p.cat.map(c2 => { const i = catInfo(c2); return '<span class="tg" style="--c:' + i.colore + '">' + i.icona + ' ' + esc(i.nome) + '</span>'; }).join('') + '</div>' +
        '<div class="ci-info">' + (p.prezzo ? eur(p.prezzo) : 'gratis') + ' · ' + p.durata.medio + ' min · ' + c.distanzaKm.toFixed(1) + ' km dall\'alloggio' + '</div>' +
        (c.escluso ? '<div class="ci-no">' + esc(c.escluso) + '</div>' :
          '<div class="ci-add">+' + T.dur(c.dMin) + (c.dEur ? ' · +' + eur(c.dEur) : '') + '</div>') +
      '</div>';
    }).join('');
    return '<h3>Attività disponibili</h3><div class="cat-list">' + (righe || '<p class="mut">Nessuna attività nel raggio scelto.</p>') + '</div>';
  }

  /* ============================================================ BUDGET (premium) */
  function renderBudget() {
    let m = document.getElementById('llm-modal');
    if (!m) { m = document.createElement('div'); m.id = 'llm-modal'; m.className = 'modal'; document.body.appendChild(m); }
    const extra = (window.BUDGET && window.BUDGET.voci()) || [];
    const totaleAttivita = window.VIAGGIO.tappe.reduce((tot, t) => tot + t.giorni.reduce((tt, g) => {
      const p = state.piani[chiavePiano(t.id, g.data)];
      return tt + (p && p.items.length ? E.valuta(p).costo : 0);
    }, 0), 0);
    const totaleExtra = extra.reduce((a, v2) => a + (+v2.importo || 0), 0);
    const totale = totaleAttivita + totaleExtra;
    const giorni = window.VIAGGIO.tappe.reduce((n, t) => n + t.giorni.length, 0);
    const budgetViaggio = E.budgetGiorno() * giorni;

    m.innerHTML = '<div class="m-back" data-act="chiudi-modal"></div><div class="m-box">' +
      '<header><div><h3>💰 Budget del viaggio</h3></div><button class="x" data-act="chiudi-modal">✕</button></header>' +
      '<div class="m-body">' +
        '<div class="kv"><div class="kv-r"><span>Attività pianificate</span><div>' + eur(totaleAttivita) + '</div></div>' +
        '<div class="kv-r"><span>Voci extra (alloggio, trasporti...)</span><div>' + eur(totaleExtra) + '</div></div>' +
        '<div class="kv-r"><span><b>Totale</b></span><div><b>' + eur(totale) + '</b> su ' + eur(budgetViaggio) + ' stimati</div></div></div>' +
        (totale > budgetViaggio ? '<p class="av err">⛔ Sfori il budget stimato di ' + eur(totale - budgetViaggio) + '.</p>' : '<p class="av ok">✓ Dentro il budget stimato.</p>') +
        '<h4>Aggiungi una voce</h4>' +
        '<div class="form"><div class="due">' +
          '<label>Descrizione<input id="b-desc" placeholder="Es: Assicurazione viaggio"></label>' +
          '<label>Importo €<input id="b-importo" type="number" step="0.5"></label></div>' +
          '<div class="riga"><button class="btn primary" data-act="budget-add">Aggiungi</button></div></div>' +
        '<ul class="tips">' + extra.map((v2, i) => '<li>' + esc(v2.descrizione) + ' — ' + eur(v2.importo) +
          ' <button class="rm" data-act="budget-rm" data-i="' + i + '">✕</button></li>').join('') + '</ul>' +
      '</div></div>';
    m.classList.remove('hidden');
  }

  /* ==================================================================== render */

  function render() {
    renderHeader(); renderTabs();
    if (state.vista === 'panoramica') renderPanoramica(); else renderGiorno();
  }
  window.APPRENDER = render;

  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.getAttribute('data-act');
    if (act === 'raggio') return; // gestito da 'change'
    e.preventDefault();
    switch (act) {
      case 'vista': state.vista = 'panoramica'; render(); break;
      case 'giorno': state.vista = 'giorno'; state.tappaId = el.getAttribute('data-t'); state.data = el.getAttribute('data-d'); render(); break;
      case 'ritmo': {
        const p = piano(state.tappaId, state.data); p.ritmo = el.getAttribute('data-r'); salva(); render(); break;
      }
      case 'genera': {
        const k = chiavePiano(state.tappaId, state.data);
        state.seme[k] = Math.floor(Math.random() * 1e9);
        const p = piano(state.tappaId, state.data);
        state.piani[k] = E.genera(state.tappaId, state.data, p.ritmo, state.seme[k], { includiFuoriScope: state.fuoriScope, raggioKm: state.raggioKm });
        salva(); render(); break;
      }
      case 'ottimizza': {
        const k = chiavePiano(state.tappaId, state.data);
        const r = E.ottimizzaPercorso(piano(state.tappaId, state.data));
        state.piani[k] = r.plan; salva(); render();
        if (r.risparmioMin > 0) setTimeout(() => alert('Percorso ottimizzato: risparmi circa ' + T.dur(r.risparmioMin) + ' di spostamenti.'), 50);
        break;
      }
      case 'pianob': {
        const k = chiavePiano(state.tappaId, state.data);
        state.piani[k] = E.pianoB(piano(state.tappaId, state.data));
        salva(); render(); break;
      }
      case 'svuota': {
        const k = chiavePiano(state.tappaId, state.data);
        state.piani[k] = { tappaId: state.tappaId, data: state.data, ritmo: piano(state.tappaId, state.data).ritmo, items: [] };
        salva(); render(); break;
      }
      case 'aggiungi': {
        if (el.classList.contains('ko')) return;
        const p = piano(state.tappaId, state.data);
        const ins = E.miglioreInserimento(p, el.getAttribute('data-id'));
        if (ins.fattibile) { p.items.splice(ins.indice, 0, { attivitaId: el.getAttribute('data-id') }); salva(); render(); }
        break;
      }
      case 'rimuovi': {
        const p = piano(state.tappaId, state.data);
        p.items = p.items.filter(i => i.attivitaId !== el.getAttribute('data-id'));
        salva(); render(); break;
      }
      case 'budget': renderBudget(); break;
      case 'budget-add': {
        const desc = document.getElementById('b-desc').value.trim();
        const importo = parseFloat(document.getElementById('b-importo').value) || 0;
        if (desc && window.BUDGET) { window.BUDGET.aggiungi(desc, importo); renderBudget(); }
        break;
      }
      case 'budget-rm': if (window.BUDGET) { window.BUDGET.rimuovi(+el.getAttribute('data-i')); renderBudget(); } break;
      case 'chiudi-modal': { const m = document.getElementById('llm-modal'); if (m) m.classList.add('hidden'); break; }
      case 'export': if (window.EXPORT) window.EXPORT.apriMenu(); break;
      case 'stampa': window.print(); break;
    }
  });

  document.addEventListener('change', function (e) {
    const el = e.target.closest('[data-act="raggio"]');
    if (!el) return;
    state.raggioKm = el.value ? parseFloat(el.value) : null;
    salva(); render();
  });

  window.VIAGGIO.budgetPersonaGiorno_display = function () {
    return window.VIAGGIO.budgetPerPersonaGiorno + ' € a persona/giorno';
  };

  carica();
  render();
})();
