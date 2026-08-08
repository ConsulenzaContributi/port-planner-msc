/* ============================================================================
   INTERFACCIA — viste, timeline, catalogo, schede, mappa, export.
   ============================================================================ */

(function () {
  const E = window.ENGINE, T = E.T;
  const CHIAVE_STORAGE = 'crociera-msc-uwsr-2026';

  const state = {
    scaloId: 'livorno',
    vista: 'panoramica',
    piani: {},
    fuoriScope: false,
    filtro: null,
    soloGratis: false,
    seme: {}
  };

  /* ------------------------------------------------------------ persistenza */
  function salva() {
    try {
      localStorage.setItem(CHIAVE_STORAGE, JSON.stringify({
        piani: state.piani, fuoriScope: state.fuoriScope, seme: state.seme
      }));
    } catch (e) { /* modalità privata: pazienza */ }
    /* js/cloud.js, se c'è e se hai fatto l'accesso, replica sul server. */
    if (window.CLOUD && window.CLOUD.dopoSalvataggio) window.CLOUD.dopoSalvataggio();
  }
  function carica() {
    try {
      const d = JSON.parse(localStorage.getItem(CHIAVE_STORAGE) || '{}');
      if (d.piani) state.piani = d.piani;
      if (d.seme) state.seme = d.seme;
      state.fuoriScope = !!d.fuoriScope;
    } catch (e) { /* niente */ }
  }

  function piano(scaloId) {
    if (!state.piani[scaloId]) state.piani[scaloId] = { scaloId: scaloId, ritmo: 'medio', items: [] };
    if (!state.piani[scaloId].ritmo) state.piani[scaloId].ritmo = 'medio';
    return state.piani[scaloId];
  }

  /* ------------------------------------------------------------- utilità */
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

  /* ================================================================ HEADER */
  function renderHeader() {
    document.getElementById('hdr').innerHTML =
      '<div class="hdr-in">' +
        '<div class="hdr-t">' +
          '<h1>' + esc(CRUISE.nave) + '</h1>' +
          '<p>' + dataIt(CRUISE.scali[0].data) + ' → ' + dataIt(CRUISE.scali[CRUISE.scali.length - 1].data) +
            ' · ' + CRUISE.notti + ' notti · itinerario ' + esc(CRUISE.itinerario) + '</p>' +
        '</div>' +
        '<div class="hdr-a">' +
          '<span class="chip">👥 ' + CRUISE.viaggiatori + ' persone</span>' +
          '<span class="chip">💶 ' + eur(E.budgetTotale()) + ' / tappa</span>' +
          '<button class="btn ghost" data-act="export">Esporta</button>' +
          '<button class="btn ghost" data-act="stampa">Stampa</button>' +
        '</div>' +
      '</div>';
  }

  /* ================================================================== TABS */
  function renderTabs() {
    const html = ['<button class="tab' + (state.vista === 'panoramica' ? ' on' : '') + '" data-act="vista" data-v="panoramica">Panoramica</button>']
      .concat(CRUISE.scali.map(function (s) {
        const on = state.vista === 'giorno' && state.scaloId === s.id;
        let sem = '';
        if (s.tipo !== 'mare') {
          const p = state.piani[s.id];
          sem = p && p.items.length ? '<i class="dot ' + E.valuta(p).rischio + '"></i>' : '<i class="dot vuoto"></i>';
        }
        return '<button class="tab' + (on ? ' on' : '') + '" data-act="giorno" data-s="' + s.id + '">' +
          sem + '<b>G' + s.giorno + '</b> ' + esc(s.citta.split(' ')[0]) +
          (s.tipo === 'imbarco' ? ' ⚓' : s.tipo === 'sbarco' ? ' 🏁' : '') + '</button>';
      })).join('');
    document.getElementById('tabs').innerHTML = html;
  }

  /* ============================================================ PANORAMICA */
  function renderPanoramica() {
    const cards = CRUISE.scali.map(function (s) {
      if (s.tipo === 'mare') {
        return '<div class="card mare"><div class="card-h"><span class="g">G' + s.giorno + '</span>' +
          '<h3>⚓ Giorno di navigazione</h3></div><p class="mut">' + esc(s.note) + '</p></div>';
      }
      const p = state.piani[s.id];
      const v = p && p.items.length ? E.valuta(p) : null;
      const f = E.finestra(s);
      return '<div class="card ' + (v ? v.rischio : '') + '" data-act="giorno" data-s="' + s.id + '">' +
        '<div class="card-h"><span class="g">G' + s.giorno + '</span>' +
          '<h3>' + s.bandiera + ' ' + esc(s.citta) + '</h3>' +
          (v ? '<span class="pill ' + v.rischio + '">' + (v.rischio === 'verde' ? 'ok' : v.rischio === 'giallo' ? 'stretto' : 'da rivedere') + '</span>' : '') +
        '</div>' +
        '<p class="sub">' + dataIt(s.data) + '</p>' +
        '<p class="orari">' + (s.arrivo ? T.hhmm(T.min(s.arrivo)) : '—') + ' → ' +
          (s.partenza ? T.hhmm(T.min(s.partenza)) : '—') +
          '<span class="mut"> · ' + (s.tipo === 'sbarco' ? 'fine finestra utile ' : 'tutti a bordo ') +
          T.hhmm(f.allAboard) + '</span></p>' +
        (v
          ? '<div class="mini"><b>' + p.items.length + '</b> tappe · <b>' + T.dur(v.tempoUsato) + '</b> impegnate · <b>' + eur(v.costo) + '</b> spesi' +
            '<div class="bars"><div class="bar"><i style="width:' + pct(v.tempoUsato, f.totale) + '%"></i></div>' +
            '<div class="bar euro"><i style="width:' + pct(v.costo, v.budget) + '%"></i></div></div></div>'
          : '<p class="vuoto-msg">Nessun programma. <b>Aprilo e generane uno.</b></p>') +
        (s.rischio === 'alto' ? '<p class="warn-inline">⚠ ' + esc(s.rischioNota) + '</p>' : '') +
      '</div>';
    }).join('');

    document.getElementById('main').innerHTML =
      '<div class="wrap">' +
        '<div class="intro"><h2>Le tue otto giornate</h2>' +
        '<p>Ogni scalo ha un tempo chiuso e un budget chiuso. Apri una giornata, scegli un\'attrazione ' +
        'come ancora e l\'app ti proporrà solo quello che ci sta ancora dentro — oppure lascia che ' +
        'generi il percorso da sola.</p></div>' +
        '<div class="grid">' + cards + '</div>' +
      '</div>';
  }
  const pct = (a, b) => Math.max(0, Math.min(100, Math.round(a / b * 100)));

  /* ================================================================ GIORNO */
  function renderGiorno() {
    const s = E.getScalo(state.scaloId);
    if (s.tipo === 'mare') {
      document.getElementById('main').innerHTML =
        '<div class="wrap"><div class="intro"><h2>⚓ Giorno di navigazione</h2><p>' + esc(s.note) + '</p>' +
        '<p class="mut">Buon momento per rivedere il piano di Tunisi, cambiare i contanti e verificare ' +
        'gli orari del giorno dopo sul Programma del Giorno di bordo.</p></div></div>';
      return;
    }

    const p = piano(s.id), v = E.valuta(p), f = E.finestra(s);
    const cands = E.candidati(p, { includiFuoriScope: state.fuoriScope });

    document.getElementById('main').innerHTML =
      '<div class="wrap giorno">' +
        barra(s, v, f) +
        '<div class="cols">' +
          '<section class="col-plan">' + controlli(s, p, v) + timeline(p, v) + '</section>' +
          '<section class="col-cat">' + catalogo(cands, v) + '</section>' +
        '</div>' +
        '<section class="mapbox"><h3>Mappa della giornata</h3><div id="map"></div>' +
        '<p class="mut small">Numeri = ordine delle tappe. Il pin scuro è il punto in cui ti lascia la navetta.</p></section>' +
      '</div>';

    setTimeout(() => disegnaMappa(s, p), 30);
  }

  function barra(s, v, f) {
    const tOk = v.tempoResiduo >= 0, cOk = v.costoResiduo >= 0;
    return '<div class="daybar">' +
      '<div class="db-t"><h2>' + s.bandiera + ' ' + esc(s.citta) + '</h2>' +
        '<p>' + dataIt(s.data) + ' · sbarco ' + (s.arrivo || '—') + ' · ' +
        '<b class="aab">tutti a bordo ' + T.hhmm(f.allAboard) + '</b>' +
        (s.offsetOreDaBordo ? ' <span class="fuso">🕐 a terra segna ' + T.hhmm(f.allAboard + s.offsetOreDaBordo * 60) + '</span>' : '') +
        '</p></div>' +
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
          '<div class="g-f">' + eur(v.costo) + ' su ' + eur(v.budget) + ' (' + CRUISE.budgetPerPersona + ' € a testa)</div>' +
        '</div>' +
      '</div></div>';
  }

  function controlli(s, p, v) {
    const rit = Object.keys(E.RITMI).map(function (k) {
      const r = E.RITMI[k];
      return '<button class="ritmo' + (p.ritmo === k ? ' on' : '') + '" data-act="ritmo" data-r="' + k + '" title="' + esc(r.desc) + '">' +
        r.icona + ' ' + r.nome + '</button>';
    }).join('');

    const av = v.avvisi.length
      ? '<div class="avvisi">' + v.avvisi.map(a =>
          '<p class="av ' + a.liv + '">' + (a.liv === 'err' ? '⛔' : a.liv === 'warn' ? '⚠️' : 'ℹ️') + ' ' + esc(a.txt) + '</p>'
        ).join('') + '</div>'
      : '';

    return '<div class="ctrl">' +
      '<div class="ctrl-r"><label>Ritmo di questa tappa</label><div class="ritmi">' + rit + '</div>' +
        '<p class="mut small">' + esc(E.RITMI[p.ritmo].desc) + '</p></div>' +
      '<div class="ctrl-b">' +
        '<button class="btn primary" data-act="genera">🎲 Genera percorso</button>' +
        (p.items.length ? '<button class="btn" data-act="rigenera">↻ Rigenera</button>' : '') +
        (p.items.length ? '<button class="btn" data-act="pianob">Piano B ridotto</button>' : '') +
        (p.items.length ? '<button class="btn ghost" data-act="svuota">Svuota</button>' : '') +
      '</div>' + av + '</div>';
  }

  function timeline(p, v) {
    if (!p.items.length) {
      return '<div class="empty"><h3>Giornata vuota</h3>' +
        '<p>Scegli un\'attrazione dal catalogo a destra: diventerà l\'<b>ancora</b> della giornata. ' +
        'Da quel momento l\'app ti mostrerà solo quello che ci sta ancora dentro, con quanto tempo ' +
        'e quanti soldi costa aggiungerlo.</p>' +
        '<p>Oppure premi <b>Genera percorso</b> e ne costruisce uno da sola.</p></div>';
    }
    let n = 0;
    const rows = v.steps.map(function (st) {
      const fine = T.hhmm(st.inizio + st.min);
      if (st.tipo === 'visit') {
        n++;
        const p2 = st.poi;
        return '<div class="step visit" data-act="scheda" data-p="' + p2.id + '">' +
          '<div class="s-time"><b>' + T.hhmm(st.inizio) + '</b><span>' + fine + '</span></div>' +
          '<div class="s-num">' + n + '</div>' +
          '<div class="s-body">' +
            '<h4>' + esc(p2.nome) + '</h4>' +
            '<div class="s-tags">' + (p2.cat || []).slice(0, 3).map(c =>
              '<span class="tg" style="--c:' + catInfo(c).colore + '">' + catInfo(c).icona + ' ' + esc(catInfo(c).nome) + '</span>').join('') + '</div>' +
            '<p class="s-meta">' + T.dur(st.min) + (st.coda ? ' (di cui ~' + st.coda + ' min di coda)' : '') +
              ' · ' + (st.costo ? eur(st.costo) + ' in due' : 'gratis') +
              (p2.slot ? ' · <b class="slot">slot orario</b>' : '') + '</p>' +
          '</div>' +
          '<div class="s-act">' +
            '<button data-act="su" data-p="' + p2.id + '" title="Sposta prima">▲</button>' +
            '<button data-act="giu" data-p="' + p2.id + '" title="Sposta dopo">▼</button>' +
            '<button data-act="togli" data-p="' + p2.id + '" title="Rimuovi">✕</button>' +
          '</div></div>';
      }
      const ico = st.tipo === 'transfer' ? '🚐' : st.tipo === 'wait' ? '⏳'
        : st.modo === 'piedi' ? '🚶' : st.modo === 'taxi' ? '🚕' : '🚇';
      return '<div class="step move">' +
        '<div class="s-time"><b>' + T.hhmm(st.inizio) + '</b></div>' +
        '<div class="s-line">' + ico + '</div>' +
        '<div class="s-body"><p>' + esc(st.titolo) +
          ' · ' + T.dur(st.min) + (st.costo ? ' · ' + eur(st.costo) : '') +
          (st.km ? ' · ' + st.km.toFixed(1) + ' km' : '') + '</p></div></div>';
    }).join('');

    const chiusura = '<div class="step end ' + v.rischio + '">' +
      '<div class="s-time"><b>' + T.hhmm(v.fine) + '</b></div>' +
      '<div class="s-line">🚢</div>' +
      '<div class="s-body"><h4>A bordo</h4><p>' +
        (v.bufferMin >= 0
          ? 'Margine di <b>' + T.dur(v.bufferMin) + '</b> sul tutti a bordo (minimo richiesto ' + T.dur(v.bufferReq) + ')'
          : '<b>Sei in ritardo di ' + T.dur(-v.bufferMin) + '.</b> Questo piano non regge.') +
      '</p></div></div>';

    return '<div class="timeline">' + rows + chiusura + '</div>' +
      '<p class="mut small tot">Totale a piedi stimato: <b>' + v.kmPiedi.toFixed(1) + ' km</b></p>';
  }

  /* --------------------------------------------------------------- catalogo */
  function catalogo(cands, v) {
    const cats = {};
    cands.forEach(c => (c.poi.cat || []).forEach(x => cats[x] = (cats[x] || 0) + 1));
    const filtri = '<button class="fl' + (!state.filtro ? ' on' : '') + '" data-act="filtro" data-c="">Tutte</button>' +
      E.CAT.filter(c => cats[c.id]).map(c =>
        '<button class="fl' + (state.filtro === c.id ? ' on' : '') + '" data-act="filtro" data-c="' + c.id + '" style="--c:' + c.colore + '">' +
        c.icona + ' ' + esc(c.nome) + ' <i>' + cats[c.id] + '</i></button>').join('');

    let lista = cands;
    if (state.filtro) lista = lista.filter(c => (c.poi.cat || []).includes(state.filtro));
    if (state.soloGratis) lista = lista.filter(c => !c.poi.prezzo);

    const cards = lista.map(function (c) {
      const p = c.poi, ok = c.fattibile;
      const resT = ok ? v.tempoResiduo - c.dMin : null;
      const resE = ok ? v.costoResiduo - c.dEur : null;
      return '<article class="poi' + (ok ? '' : ' off') + '">' +
        (p.immagine && p.immagine.url
          ? '<img class="p-thumb" src="' + esc(p.immagine.url) + '" alt="" loading="lazy" data-act="scheda" data-p="' + p.id + '" onerror="this.remove()">'
          : '') +
        '<div class="p-h">' +
          '<h4 data-act="scheda" data-p="' + p.id + '">' + esc(p.nome) + '</h4>' +
          '<span class="stars">' + '★'.repeat(p.top || 1) + '</span>' +
        '</div>' +
        '<div class="p-tags">' + (p.cat || []).slice(0, 3).map(x =>
          '<span class="tg" style="--c:' + catInfo(x).colore + '">' + catInfo(x).icona + ' ' + esc(catInfo(x).nome) + '</span>').join('') +
          (p.fuoriScope ? '<span class="tg fs">📍 fuori scope</span>' : '') + '</div>' +
        '<p class="p-desc">' + esc(p.perche.slice(0, 165)) + '…</p>' +
        (ok
          ? '<div class="p-cost"><span class="delta">+' + T.dur(c.dMin) + '</span>' +
            '<span class="delta euro">+' + (c.dEur ? eur(c.dEur) : '€ 0') + '</span>' +
            '<span class="resta">poi restano ' + T.dur(resT) + ' e ' + eur(resE) + '</span></div>'
          : '<div class="p-cost ko">⛔ ' + esc(c.escluso) + '</div>') +
        '<div class="p-act">' +
          '<button class="btn tiny ghost" data-act="scheda" data-p="' + p.id + '">Scheda</button>' +
          (ok ? '<button class="btn tiny primary" data-act="aggiungi" data-p="' + p.id + '">+ Aggiungi</button>' : '') +
        '</div></article>';
    }).join('');

    const scopeBtn = E.poiDiScalo(state.scaloId, true).some(p => p.fuoriScope)
      ? '<label class="tog"><input type="checkbox" data-act="scope"' + (state.fuoriScope ? ' checked' : '') + '> Includi le mete fuori dallo scope «solo città di sbarco»</label>'
      : '';

    return '<div class="cat-h"><h3>Attrazioni disponibili</h3>' +
      '<label class="tog"><input type="checkbox" data-act="gratis"' + (state.soloGratis ? ' checked' : '') + '> Solo gratuite</label>' +
      scopeBtn + '</div>' +
      '<div class="filtri">' + filtri + '</div>' +
      '<div class="poilist">' + (cards || '<p class="mut">Nessuna attrazione con questi filtri.</p>') + '</div>';
  }

  /* ================================================================ SCHEDA */
  function apriScheda(id) {
    const p = E.getPoi(id);
    const s = E.getScalo(state.scaloId);
    const chiuso = E.chiusoOggi(p, s);

    const immagine = p.immagine && p.immagine.url
      ? '<div class="p-img"><img src="' + esc(p.immagine.url) + '" alt="' + esc(p.nome) + '" loading="lazy" ' +
        'onerror="this.parentElement.remove()">' +
        (p.immagine.credito ? '<span class="p-img-c">' + esc(p.immagine.credito) + '</span>' : '') + '</div>'
      : '';
    const fonti = (p.fonti && p.fonti.length)
      ? riga('Fonti', p.fonti.map(f => '<a href="' + esc(f.url) + '" target="_blank" rel="noopener">' + esc(f.titolo) + '</a>').join(' · '))
      : '';

    const prep =
      immagine +
      '<p class="lead">' + esc(p.perche) + '</p>' +
      '<div class="kv">' +
        riga('Durata consigliata', Object.keys(E.RITMI).map(k =>
          E.RITMI[k].icona + ' ' + E.RITMI[k].nome + ' ' + T.dur(p.durata[E.RITMI[k].durata])).join(' &nbsp;·&nbsp; ')) +
        riga('Costo biglietto', (p.prezzo ? '<b>' + eur(p.prezzo) + ' a persona</b> · ' + eur(p.prezzo * CRUISE.viaggiatori) + ' in due' : '<b>Gratuito</b>')) +
        riga('Dettaglio prezzi', esc(p.prezzoNote)) +
        riga('Orari', esc(p.orari.da + ' – ' + p.orari.a) +
          (p.chiusoGiorni && p.chiusoGiorni.length ? ' · chiuso ' + p.chiusoGiorni.map(g => GIORNI[g].toLowerCase()).join(', ') : '') +
          (chiuso ? ' <b class="rossoT">— OGGI È CHIUSO</b>' : '')) +
        riga('Coda stimata', p.coda ? p.coda.tipica + ' min normalmente, fino a ' + p.coda.punta + ' min nelle ore di punta' : '—') +
        riga('Prenotazione',
          p.prenota
            ? (p.prenota.url ? '<a href="' + esc(p.prenota.url) + '" target="_blank" rel="noopener">' + esc(p.prenota.url) + '</a><br>' : '') +
              '<b>Prenota con ' + p.prenota.anticipoGiorni + ' giorni di anticipo.</b><br>' + esc(p.prenota.note)
            : 'Non necessaria') +
        (p.saltafila ? riga('Salta fila', esc(p.saltafila)) : '') +
        riga('Fatica', (p.fatica.km || 0) + ' km a piedi · ' + (p.fatica.gradini || 0) + ' gradini · ombra: ' + esc(p.fatica.ombra)) +
        riga('Momento migliore', esc({ mattina: 'La mattina', pomeriggio: 'Il pomeriggio', pranzo: 'All\'ora di pranzo', qualsiasi: 'Qualsiasi ora' }[p.quando] || p.quando)) +
        riga('Servizi igienici', esc(p.wc || '—')) +
        fonti +
      '</div>' +
      (p.tips && p.tips.length ? '<h4>Consigli</h4><ul class="tips">' + p.tips.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>' : '') +
      '<p class="verif">Dati raccolti il ' + esc(p.verificato) +
        (p.daVerificare ? ' · <b>da riverificare prima della partenza</b>' : '') + '</p>';

    const visita =
      '<div class="invisita">' +
        '<h4>Da non perdere</h4>' +
        '<ol class="big">' + (p.visita || []).map(x => '<li>' + esc(x) + '</li>').join('') + '</ol>' +
        '<div class="iv-grid">' +
          '<div><span>Durata</span><b>' + T.dur(p.durata[E.RITMI[piano(state.scaloId).ritmo].durata]) + '</b></div>' +
          '<div><span>Costo in due</span><b>' + (p.prezzo ? eur(p.prezzo * CRUISE.viaggiatori) : 'gratis') + '</b></div>' +
          '<div><span>Bagni</span><b>' + esc(p.wc || '—') + '</b></div>' +
          '<div><span>Gradini</span><b>' + (p.fatica.gradini || 0) + '</b></div>' +
        '</div>' +
        oraDiRipartire(p) +
      '</div>';

    document.getElementById('modal').innerHTML =
      '<div class="m-back" data-act="chiudi"></div>' +
      '<div class="m-box">' +
        '<header><div><h3>' + esc(p.nome) + '</h3>' +
          '<div class="p-tags">' + (p.cat || []).map(x =>
            '<span class="tg" style="--c:' + catInfo(x).colore + '">' + catInfo(x).icona + ' ' + esc(catInfo(x).nome) + '</span>').join('') + '</div></div>' +
          '<button class="x" data-act="chiudi">✕</button></header>' +
        '<div class="m-tabs"><button class="mt on" data-act="mtab" data-t="prep">Preparazione</button>' +
          '<button class="mt" data-act="mtab" data-t="visita">In visita</button></div>' +
        '<div class="m-body"><div id="mt-prep">' + prep + '</div><div id="mt-visita" hidden>' + visita + '</div></div>' +
        '<footer>' +
          (piano(state.scaloId).items.some(i => i.poiId === p.id)
            ? '<button class="btn ghost" data-act="togli" data-p="' + p.id + '">Togli dal programma</button>'
            : '<button class="btn primary" data-act="aggiungi" data-p="' + p.id + '">+ Aggiungi al programma</button>') +
          (p.prenota && p.prenota.url ? '<a class="btn" href="' + esc(p.prenota.url) + '" target="_blank" rel="noopener">Prenota online ↗</a>' : '') +
        '</footer>' +
      '</div>';
    document.getElementById('modal').classList.remove('hidden');
  }

  function oraDiRipartire(p) {
    const pl = piano(state.scaloId), v = E.valuta(pl);
    const st = v.steps.find(x => x.tipo === 'visit' && x.poi.id === p.id);
    if (!st) return '<p class="mut">Non è ancora nel programma di oggi.</p>';
    return '<div class="ripartire"><span>Devi ripartire da qui entro le</span><b>' +
      T.hhmm(st.inizio + st.min) + '</b>' +
      '<span>per essere a bordo alle ' + T.hhmm(v.finestra.allAboard) + ' con ' + T.dur(v.bufferMin) + ' di margine</span></div>';
  }
  const riga = (k, v) => '<div class="kv-r"><span>' + k + '</span><div>' + v + '</div></div>';

  /* ================================================================= MAPPA */
  let mappa = null, strato = null;
  function disegnaMappa(s, p) {
    const el = document.getElementById('map');
    if (!el) return;
    if (typeof L === 'undefined') {
      el.innerHTML = '<div class="nomap">La mappa richiede una connessione al primo caricamento. ' +
        'Tutto il resto dell\'app funziona offline.</div>';
      return;
    }
    if (mappa) { mappa.remove(); mappa = null; }
    const centro = (s.accesso && s.accesso.arrivoCitta) || s.ormeggio.coord;
    mappa = L.map(el, { scrollWheelZoom: false }).setView(centro, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '© OpenStreetMap', maxZoom: 18 }).addTo(mappa);

    const gruppo = L.featureGroup().addTo(mappa);
    L.marker(s.ormeggio.coord, { icon: pin('⚓', '#1f2937') })
      .bindPopup('<b>' + esc(s.ormeggio.nome) + '</b>').addTo(gruppo);
    if (s.accesso && s.accesso.arrivoCitta)
      L.marker(s.accesso.arrivoCitta, { icon: pin('🚐', '#475569') })
        .bindPopup('Punto navetta / arrivo in città').addTo(gruppo);

    /* Popup coerente in entrambi i casi: nome, prezzo, un link alla scheda
       vera e un pulsante rapido. I click passano dalla delega su document
       (data-act), la stessa che usa il resto dell'app — Leaflet mette questo
       HTML nel DOM reale, quindi funziona senza codice apposta. */
    function popup(poi, inProgramma) {
      return '<div class="map-pop">' +
        '<b data-act="scheda" data-p="' + poi.id + '">' + esc(poi.nome) + '</b>' +
        '<span>' + (poi.prezzo ? eur(poi.prezzo) + ' a persona' : 'gratis') + '</span>' +
        '<div class="map-pop-act">' +
        '<button class="btn tiny ghost" data-act="scheda" data-p="' + poi.id + '">Scheda</button>' +
        (inProgramma
          ? '<button class="btn tiny ghost" data-act="togli" data-p="' + poi.id + '">Togli</button>'
          : '<button class="btn tiny primary" data-act="aggiungi" data-p="' + poi.id + '">+ Aggiungi</button>') +
        '</div></div>';
    }

    const punti = [];
    p.items.forEach(function (it, i) {
      const poi = E.getPoi(it.poiId);
      if (!poi) return;
      punti.push(poi.coord);
      L.marker(poi.coord, { icon: pin(i + 1, catInfo(poi.cat[0]).colore) })
        .bindPopup(popup(poi, true)).addTo(gruppo);
    });
    if (punti.length > 1)
      L.polyline([s.accesso && s.accesso.arrivoCitta || s.ormeggio.coord].concat(punti),
        { color: '#0f766e', weight: 3, opacity: .65, dashArray: '6 5' }).addTo(gruppo);

    /* Tutte le altre attrazioni della città, scelte o no: qui sta la risposta
       a "voglio vedere sulla mappa anche quelle non selezionate" — il gruppo
       di marker grigi qui sotto è già dentro fitBounds, quindi restano
       visibili insieme al percorso, non fuori inquadratura. */
    E.poiDiScalo(s.id, state.fuoriScope).forEach(function (poi) {
      if (p.items.some(i => i.poiId === poi.id)) return;
      L.circleMarker(poi.coord, { radius: 6, color: '#94a3b8', fillColor: '#cbd5e1', fillOpacity: .85, weight: 1.5 })
        .bindPopup(popup(poi, false)).addTo(gruppo);
    });

    try { mappa.fitBounds(gruppo.getBounds().pad(0.15)); } catch (e) { /* un solo punto */ }
  }
  function pin(txt, colore) {
    return L.divIcon({ className: 'mk', iconSize: [28, 28], iconAnchor: [14, 14],
      html: '<div style="background:' + colore + '">' + txt + '</div>' });
  }

  /* ================================================================ EXPORT */
  function esporta() {
    const out = {
      generato: new Date().toISOString(), crociera: CRUISE.id, nave: CRUISE.nave,
      giornate: CRUISE.scali.filter(s => state.piani[s.id] && state.piani[s.id].items.length).map(function (s) {
        const p = state.piani[s.id], v = E.valuta(p);
        return {
          giorno: s.giorno, data: s.data, citta: s.citta, ritmo: p.ritmo,
          tuttiABordo: T.hhmm(v.finestra.allAboard), rientroPrevisto: T.hhmm(v.fine),
          margineMin: v.bufferMin, costoTotale: v.costo, rischio: v.rischio,
          programma: v.steps.filter(x => x.tipo === 'visit').map(x => ({
            ora: T.hhmm(x.inizio), fine: T.hhmm(x.inizio + x.min), nome: x.poi.nome,
            costoInDue: (x.poi.prezzo || 0) * CRUISE.viaggiatori,
            prenotazione: x.poi.prenota ? x.poi.prenota.url : null
          }))
        };
      })
    };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' }));
    a.download = 'programma-crociera-msc-2026.json';
    a.click();
  }

  /* ================================================================ EVENTI */
  function agisci(act, el) {
    const p = piano(state.scaloId);
    const id = el.getAttribute('data-p');
    switch (act) {
      case 'vista': state.vista = el.getAttribute('data-v'); break;
      case 'giorno': state.vista = 'giorno'; state.scaloId = el.getAttribute('data-s'); state.filtro = null; break;
      case 'ritmo': p.ritmo = el.getAttribute('data-r'); break;
      case 'filtro': state.filtro = el.getAttribute('data-c') || null; break;
      case 'gratis': state.soloGratis = el.checked; break;
      case 'scope': state.fuoriScope = el.checked; break;
      case 'aggiungi': {
        const ins = E.miglioreInserimento(p, id);
        p.items.splice(ins.indice, 0, { poiId: id });
        chiudiModal(); break;
      }
      case 'togli': p.items = p.items.filter(i => i.poiId !== id); chiudiModal(); break;
      case 'su': { const i = p.items.findIndex(x => x.poiId === id); if (i > 0) p.items.splice(i - 1, 0, p.items.splice(i, 1)[0]); break; }
      case 'giu': { const i = p.items.findIndex(x => x.poiId === id); if (i >= 0 && i < p.items.length - 1) p.items.splice(i + 1, 0, p.items.splice(i, 1)[0]); break; }
      case 'svuota': p.items = []; break;
      case 'genera':
      case 'rigenera': {
        state.seme[state.scaloId] = Math.floor(Math.random() * 1e9);
        state.piani[state.scaloId] = E.genera(state.scaloId, p.ritmo, state.seme[state.scaloId],
          { includiFuoriScope: state.fuoriScope });
        break;
      }
      case 'pianob': state.piani[state.scaloId] = E.pianoB(p); break;
      case 'scheda': apriScheda(id); return;              /* niente re-render */
      case 'chiudi': chiudiModal(); return;
      case 'mtab': {
        const t = el.getAttribute('data-t');
        document.querySelectorAll('.mt').forEach(b => b.classList.toggle('on', b === el));
        document.getElementById('mt-prep').hidden = t !== 'prep';
        document.getElementById('mt-visita').hidden = t !== 'visita';
        return;
      }
      case 'export': esporta(); return;
      case 'stampa': window.print(); return;
      default: return;
    }
    salva(); render();
  }
  function chiudiModal() { document.getElementById('modal').classList.add('hidden'); salva(); render(); }

  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    if (el.tagName === 'A') return;
    if (el.tagName === 'INPUT') return;
    e.preventDefault(); e.stopPropagation();
    agisci(el.getAttribute('data-act'), el);
  });
  document.addEventListener('change', function (e) {
    const el = e.target.closest('[data-act]');
    if (el && el.tagName === 'INPUT') agisci(el.getAttribute('data-act'), el);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') chiudiModal(); });

  /* ================================================================== BOOT */
  function render() {
    renderHeader(); renderTabs();
    if (state.vista === 'panoramica') renderPanoramica(); else renderGiorno();
  }
  carica();
  render();
  window.APPSTATE = state;
  window.APPRENDER = render;      /* llm.js lo richiama dopo aver aggiunto una tappa */
  window.APPSALVA = salva;
})();
