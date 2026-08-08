/* ============================================================================
   MOTORE TRAVEL — generalizzazione di js/engine.js (progetto crociera).
   Stessa logica di fondo (fattibilità, doppio budget tempo+denaro, inserimento
   incrementale, generatore automatico), ma per TAPPE con più giorni invece di
   scali di una sola giornata:

     scalo (crociera)         →  tappa (travel): più giorni di permanenza
     nave / "tutti a bordo"   →  alloggio della tappa, rientro entro sera
     ormeggio.coord           →  alloggio.coord (punto di partenza/rientro)
     un piano per scalo       →  un piano per GIORNO dentro una tappa

   Nessuna dipendenza esterna. Tutto sincrono.
   ============================================================================ */

window.ENGINE = (function () {

  /* ---------------------------------------------------------------- tempo */
  const T = {
    min(hhmm) { if (!hhmm) return null; const p = hhmm.split(':'); return +p[0] * 60 + +p[1]; },
    hhmm(m) { m = Math.round(m); const h = Math.floor(m / 60) % 24, x = ((m % 60) + 60) % 60;
              return String(h).padStart(2, '0') + ':' + String(x).padStart(2, '0'); },
    dur(m) { m = Math.round(m); const neg = m < 0; m = Math.abs(m);
             const h = Math.floor(m / 60), x = m % 60;
             return (neg ? '−' : '') + (h ? h + 'h ' + String(x).padStart(2, '0') + 'm' : x + ' min'); }
  };

  /* --------------------------------------------------------------- catalogo */
  /* Le attività note al caricamento (file data/attivita-*.js). In produzione
     si aggiungono dinamicamente via js/ricerca-attivita.js (Google Places),
     con lo stesso identico shape: registraAttivita() le innesta nel motore. */
  const ATTIVITA = [];
  Object.keys(window).forEach(k => {
    if (/^ATTIVITA_/.test(k) && Array.isArray(window[k])) ATTIVITA.push.apply(ATTIVITA, window[k]);
  });

  const CHIAVE_CUSTOM = 'travel-attivita-custom';
  function caricaCustom() {
    try {
      const extra = JSON.parse(localStorage.getItem(CHIAVE_CUSTOM) || '[]');
      extra.forEach(p => { if (p && p.id && !ATTIVITA.some(x => x.id === p.id)) { p.custom = true; ATTIVITA.push(p); } });
    } catch (e) { /* storage non disponibile */ }
  }
  caricaCustom();

  const attivitaById = {};
  ATTIVITA.forEach(p => { attivitaById[p.id] = p; });

  function salvaCustom() {
    try { localStorage.setItem(CHIAVE_CUSTOM, JSON.stringify(ATTIVITA.filter(p => p.custom))); }
    catch (e) { /* storage non disponibile */ }
  }
  function registraAttivita(p) {
    p.custom = true;
    const i = ATTIVITA.findIndex(x => x.id === p.id);
    if (i >= 0) ATTIVITA[i] = p; else ATTIVITA.push(p);
    attivitaById[p.id] = p;
    salvaCustom();
    return p;
  }
  function eliminaAttivita(id) {
    const i = ATTIVITA.findIndex(x => x.id === id && x.custom);
    if (i < 0) return false;
    ATTIVITA.splice(i, 1); delete attivitaById[id]; salvaCustom();
    return true;
  }

  const tappaById = {};
  (window.VIAGGIO ? window.VIAGGIO.tappe : []).forEach(t => { tappaById[t.id] = t; });

  function getTappa(id) { return tappaById[id]; }
  function getAttivita(id) { return attivitaById[id]; }
  function attivitaDiTappa(tappaId, includiFuoriScope) {
    return ATTIVITA.filter(p => p.tappa === tappaId && (includiFuoriScope || !p.fuoriScope));
  }

  /* ------------------------------------------------------------- geografia */
  function km(a, b) {
    const R = 6371, r = x => x * Math.PI / 180;
    const dLa = r(b[0] - a[0]), dLo = r(b[1] - a[1]);
    const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLo / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  /* Tempo e costo di uno spostamento urbano.
     Se data/matrix.js è presente si usano i tempi REALI di Google Maps (stesso
     meccanismo del progetto crociera: MATRIX[tappaId]); altrimenti stima
     geometrica — prudente, ma pur sempre stima. */
  const mk = c => c[0].toFixed(5) + ',' + c[1].toFixed(5);
  function daMatrice(from, to, tappa) {
    const m = window.MATRIX && window.MATRIX[tappa.id];
    if (!m) return null;
    const k = mk(from) + '|' + mk(to);
    const piedi = m.piedi && m.piedi[k], mezzi = m.mezzi && m.mezzi[k];
    if (!piedi && !mezzi) return null;
    if (piedi && piedi[0] <= 25)
      return { min: piedi[0], costo: 0, modo: 'piedi', km: (piedi[1] || 0) / 1000, reale: true };
    if (mezzi && (!piedi || mezzi[0] + 6 < piedi[0]))
      return { min: mezzi[0] + 6, costo: 3, modo: 'mezzi', km: (mezzi[1] || 0) / 1000, reale: true };
    if (piedi) return { min: piedi[0], costo: 0, modo: 'piedi', km: (piedi[1] || 0) / 1000, reale: true };
    return null;
  }

  function tratta(from, to, tappa) {
    const reale = daMatrice(from, to, tappa);
    if (reale) return reale;

    const d = km(from, to) * 1.35;                       // fattore di tortuosità urbana
    if (d < 0.05) return { min: 0, costo: 0, modo: 'piedi', km: 0 };
    if (d <= 2.2) return { min: Math.round(d / 4.5 * 60) + 2, costo: 0, modo: 'piedi', km: d };
    if (d <= 9) return { min: Math.round(d / 15 * 60) + 9, costo: 3, modo: 'mezzi', km: d };
    return { min: Math.round(d / 25 * 60) + 10, costo: 6, modo: 'taxi', km: d };
  }

  /* ------------------------------------------------------- finestra del giorno */
  /* Un giorno "normale" dentro una tappa va dalle 09:00 alle 20:00. Il primo
     giorno della tappa parte dall'orario di check-in (o dall'arrivo stimato,
     se c'è un trasferimento dalla tappa precedente); l'ultimo giorno finisce
     al check-out (o prima, se c'è un trasferimento verso la tappa successiva). */
  function primoGiornoTappa(tappa) { return tappa.giorni[0] && tappa.giorni[0].data === tappa.dataInizio; }
  function ultimoGiornoTappa(tappa, data) { return tappa.giorni[tappa.giorni.length - 1] && tappa.giorni[tappa.giorni.length - 1].data === data; }

  function finestraGiorno(tappa, data) {
    let inizio = T.min('09:00'), fine = T.min('20:00');
    const primoGiornoViaggio = window.VIAGGIO && data === window.VIAGGIO.dataPartenza;

    if (data === tappa.dataInizio) {
      if (tappa.trasferimento) {
        // Si arriva in giornata: l'orario utile parte dopo il viaggio + margine.
        inizio = Math.max(T.min('09:00') + tappa.trasferimento.minuti + 20, T.min(tappa.alloggio.checkIn || '14:00'));
      } else if (primoGiornoViaggio) {
        inizio = T.min('11:00');                          // giorno di partenza del viaggio
      } else {
        inizio = Math.min(T.min('09:00'), T.min(tappa.alloggio.checkIn || '09:00'));
      }
    }
    const ultimoGiornoViaggio = window.VIAGGIO && data === window.VIAGGIO.dataFine;
    if (ultimoGiornoTappa(tappa, data)) {
      const prossimaTappa = (window.VIAGGIO.tappe || []).find(t => t.trasferimento && t.trasferimento.daTappa === tappa.id);
      if (prossimaTappa) fine = T.min('16:00') - prossimaTappa.trasferimento.minuti; // parte nel pomeriggio
      else if (ultimoGiornoViaggio) fine = T.min(tappa.alloggio.checkOut || '11:00') + 60;
      else fine = T.min(tappa.alloggio.checkOut || '11:00') + 180;
    }
    return { inizio, fine, totale: fine - inizio };
  }

  /* Buffer minimo prima del rientro in alloggio (o della partenza). */
  function bufferRichiesto(tappa, ritmoId) {
    let b = (RITMI[ritmoId] || RITMI.medio).bufferMin;
    if (tappa.paese && window.VIAGGIO && window.VIAGGIO.paeseBase && tappa.paese !== window.VIAGGIO.paeseBase) b += 15;
    if (tappa.rischio === 'alto') b += 30;
    return b;
  }

  function budgetGiorno() { return window.VIAGGIO.budgetPerPersonaGiorno * window.VIAGGIO.viaggiatori; }

  /* --------------------------------------------------------------- aperture */
  function chiusoOggi(p, giornoSettimana) { return (p.chiusoGiorni || []).indexOf(giornoSettimana) >= 0; }

  function codaStimata(p, oraArrivo) {
    if (!p.coda) return 0;
    const punta = oraArrivo >= T.min('10:30') && oraArrivo <= T.min('15:00');
    return punta ? Math.round((p.coda.tipica + p.coda.punta) / 2) : (p.coda.tipica || 0);
  }

  /* ============================ VALUTAZIONE DI UN PIANO ==================== */
  /* plan = { tappaId, data, ritmo, items:[{attivitaId}] }  →  oggetto completo
     con steps, tempi, costi, buffer, avvisi e fattibilità. */
  function valuta(plan) {
    const tappa = getTappa(plan.tappaId);
    const giorno = tappa.giorni.find(g => g.data === plan.data) || tappa.giorni[0];
    const ritmo = RITMI[plan.ritmo] || RITMI.medio;
    const f = finestraGiorno(tappa, plan.data);
    const partenza = tappa.alloggio.coord;

    let t = f.inizio, costo = 0, kmPiedi = 0;
    const steps = [], avvisi = [];

    let pos = partenza;
    plan.items.forEach(function (it) {
      const p = getAttivita(it.attivitaId);
      if (!p) return;

      const tr = tratta(pos, p.coord, tappa);
      if (tr.min > 0) {
        steps.push({ tipo: 'move', titolo: 'Spostamento', modo: tr.modo, km: tr.km,
                     inizio: t, min: tr.min, costo: tr.costo });
        t += tr.min; costo += tr.costo;
        if (tr.modo === 'piedi') kmPiedi += tr.km;
      }

      const apre = T.min(p.orari.da), chiude = T.min(p.orari.a);
      if (t < apre) {
        const attesa = apre - t;
        steps.push({ tipo: 'wait', titolo: p.nome + ' apre alle ' + p.orari.da, inizio: t, min: attesa, costo: 0 });
        t += attesa;
        if (attesa > 45)
          avvisi.push({ liv: 'warn', txt: T.dur(attesa) + ' di attesa prima che apra ' + p.nome +
            ': spostalo più avanti nella giornata o riempi il buco.' });
      }

      const durata = p.durata[ritmo.durata];
      const coda = codaStimata(p, t);
      steps.push({ tipo: 'visit', poi: p, titolo: p.nome, inizio: t, min: durata + coda,
                   coda: coda, costo: (p.prezzo || 0) * window.VIAGGIO.viaggiatori });
      t += durata + coda;
      costo += (p.prezzo || 0) * window.VIAGGIO.viaggiatori;
      kmPiedi += (p.fatica && p.fatica.km) || 0;

      if (t > chiude) avvisi.push({ liv: 'err', txt: p.nome + ' chiude alle ' + p.orari.a + ' e la visita finirebbe alle ' + T.hhmm(t) + '.' });
      if (chiusoOggi(p, giorno.giornoSettimana)) avvisi.push({ liv: 'err', txt: p.nome + ' è CHIUSO ' + nomeGiorno(giorno.giornoSettimana) + '.' });
      if (p.slot) avvisi.push({ liv: 'info', txt: p.nome + ' richiede un biglietto a fascia oraria: prenota lo slot delle ' + T.hhmm(steps[steps.length - 1].inizio) + ' circa.' });

      pos = p.coord;
    });

    /* rientro in alloggio */
    const back = tratta(pos, partenza, tappa);
    if (back.min > 0) {
      steps.push({ tipo: 'move', titolo: 'Rientro in alloggio', modo: back.modo, km: back.km,
                   inizio: t, min: back.min, costo: back.costo });
      t += back.min; costo += back.costo;
      if (back.modo === 'piedi') kmPiedi += back.km;
    }

    const bufferMin = f.fine - t;
    const bufferReq = bufferRichiesto(tappa, plan.ritmo);
    const budget = budgetGiorno();

    if (kmPiedi > ritmo.maxKmPiedi)
      avvisi.push({ liv: 'warn', txt: 'Circa ' + kmPiedi.toFixed(1) + ' km a piedi: oltre i ' + ritmo.maxKmPiedi + ' km previsti dal ritmo ' + ritmo.nome + '.' });
    if (costo > budget)
      avvisi.push({ liv: 'err', txt: 'Budget del giorno sforato di € ' + (costo - budget).toFixed(0) + ' su € ' + budget + ' disponibili.' });
    if (bufferMin < bufferReq)
      avvisi.push({ liv: bufferMin < 0 ? 'err' : 'warn',
                    txt: bufferMin < 0 ? 'PIANO TROPPO PIENO: si rientrerebbe ' + T.dur(-bufferMin) + ' oltre la fine della giornata.'
                                       : 'Margine di soli ' + T.dur(bufferMin) + ': ne servono almeno ' + T.dur(bufferReq) + '.' });

    const ok = bufferMin >= bufferReq && costo <= budget && !avvisi.some(a => a.liv === 'err');

    return {
      tappa: tappa, giorno: giorno, ritmo: ritmo, steps: steps, finestra: f,
      fine: t, bufferMin: bufferMin, bufferReq: bufferReq,
      tempoUsato: t - f.inizio, tempoResiduo: bufferMin - bufferReq,
      costo: costo, budget: budget, costoResiduo: budget - costo,
      kmPiedi: kmPiedi, avvisi: avvisi, fattibile: ok,
      rischio: livelloRischio(bufferMin, bufferReq, costo, budget, avvisi)
    };
  }

  function livelloRischio(buf, req, costo, budget, avvisi) {
    if (buf < 0 || costo > budget || avvisi.some(a => a.liv === 'err')) return 'rosso';
    if (buf < req) return 'rosso';
    if (buf < req * 1.6 || costo > budget * 0.92) return 'giallo';
    return 'verde';
  }

  function nomeGiorno(n) {
    return ['la domenica', 'il lunedì', 'il martedì', 'il mercoledì', 'il giovedì', 'il venerdì', 'il sabato'][n];
  }

  /* ======================= INSERIMENTO INCREMENTALE ======================= */
  function clona(plan) { return { tappaId: plan.tappaId, data: plan.data, ritmo: plan.ritmo, items: plan.items.map(i => ({ attivitaId: i.attivitaId })) }; }

  function miglioreInserimento(plan, attivitaId) {
    const base = valuta(plan);
    let best = null;
    for (let i = 0; i <= plan.items.length; i++) {
      const test = clona(plan);
      test.items.splice(i, 0, { attivitaId: attivitaId });
      const v = valuta(test);
      const dMin = v.fine - base.fine;
      const dEur = v.costo - base.costo;
      const cand = { indice: i, dMin: dMin, dEur: dEur, val: v, fattibile: v.fattibile };
      if (!best) best = cand;
      else if (cand.fattibile && !best.fattibile) best = cand;
      else if (cand.fattibile === best.fattibile && cand.dMin < best.dMin) best = cand;
    }
    return best;
  }

  /* Restituisce TUTTE le attività non ancora nel piano del giorno, con costo
     di inserimento e, se non entrano, il motivo esatto. Filtra per distanza
     massima dall'alloggio se opt.raggioKm è impostato (fattore premium: "vicino
     al luogo di pernotto"). */
  function candidati(plan, opt) {
    opt = opt || {};
    const tappa = getTappa(plan.tappaId);
    const giorno = tappa.giorni.find(g => g.data === plan.data) || tappa.giorni[0];
    const inPiano = {}; plan.items.forEach(i => inPiano[i.attivitaId] = true);

    return attivitaDiTappa(plan.tappaId, opt.includiFuoriScope)
      .filter(p => !inPiano[p.id])
      .filter(p => !opt.raggioKm || km(tappa.alloggio.coord, p.coord) <= opt.raggioKm)
      .map(function (p) {
        const r = { poi: p, distanzaKm: km(tappa.alloggio.coord, p.coord) };
        if (chiusoOggi(p, giorno.giornoSettimana)) {
          r.escluso = 'Chiuso ' + nomeGiorno(giorno.giornoSettimana);
          r.dMin = null; r.dEur = (p.prezzo || 0) * window.VIAGGIO.viaggiatori;
          return r;
        }
        const ins = miglioreInserimento(plan, p.id);
        r.dMin = ins.dMin; r.dEur = ins.dEur; r.indice = ins.indice; r.val = ins.val;
        r.fattibile = ins.fattibile;
        if (!ins.fattibile) {
          const v = ins.val;
          if (v.costo > v.budget) r.escluso = 'Sfora il budget di € ' + (v.costo - v.budget).toFixed(0);
          else if (v.bufferMin < 0) r.escluso = 'Non si rientra in tempo: mancherebbero ' + T.dur(-v.bufferMin);
          else if (v.bufferMin < v.bufferReq) r.escluso = 'Servono ' + T.dur(v.bufferReq - v.bufferMin) + ' in più';
          else {
            const err = v.avvisi.find(a => a.liv === 'err');
            r.escluso = err ? err.txt : 'Non compatibile con questo programma';
          }
        }
        return r;
      })
      .sort(function (a, b) {
        if (a.fattibile !== b.fattibile) return a.fattibile ? -1 : 1;
        if (a.escluso && b.escluso) return (b.poi.top || 0) - (a.poi.top || 0);
        const sa = (a.poi.top || 1) / Math.max(15, a.dMin || 999);
        const sb = (b.poi.top || 1) / Math.max(15, b.dMin || 999);
        return sb - sa;
      });
  }

  /* ================== GENERATORE AUTOMATICO DI PERCORSO ================== */
  function prng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function pescaPesato(lista, pesi, rnd) {
    const tot = pesi.reduce((a, b) => a + b, 0);
    if (tot <= 0) return null;
    let x = rnd() * tot;
    for (let i = 0; i < lista.length; i++) { x -= pesi[i]; if (x <= 0) return lista[i]; }
    return lista[lista.length - 1];
  }

  function riparaOrari(plan) {
    for (let pass = 0; pass < 8; pass++) {
      const v = valuta(plan);
      let mosso = false;
      for (let i = 0; i < plan.items.length; i++) {
        const p = getAttivita(plan.items[i].attivitaId);
        const st = v.steps.find(x => x.tipo === 'visit' && x.poi.id === p.id);
        if (!st) continue;
        if (st.inizio < T.min(p.orari.da) - 2 && i < plan.items.length - 1) {
          plan.items.splice(i + 1, 0, plan.items.splice(i, 1)[0]); mosso = true; break;
        }
        if (st.inizio + st.min > T.min(p.orari.a) && i > 0) {
          plan.items.splice(i - 1, 0, plan.items.splice(i, 1)[0]); mosso = true; break;
        }
      }
      if (!mosso) break;
    }
  }

  /* opt.raggioKm: limita il generatore alle attività entro N km dall'alloggio
     (idea premium "organizzare in base alla distanza dal luogo di permanenza"). */
  function genera(tappaId, data, ritmoId, seed, opt) {
    opt = opt || {};
    const rnd = prng(seed || Math.floor(Math.random() * 1e9));
    const ritmo = RITMI[ritmoId] || RITMI.medio;
    const tappa = getTappa(tappaId);
    const plan = { tappaId: tappaId, data: data, ritmo: ritmoId, items: (opt.bloccati || []).map(id => ({ attivitaId: id })) };

    const f = finestraGiorno(tappa, data);
    const target = Math.max(1, Math.min(ritmo.maxTappe, Math.round(f.totale / ritmo.minPerTappa)));

    const disponibili = () => candidati(plan, opt).filter(c => c.fattibile);

    if (plan.items.length === 0) {
      const forti = disponibili().filter(c => (c.poi.top || 0) >= 4 && !c.poi.cat.includes('cibo'));
      if (forti.length) {
        const scelta = pescaPesato(forti, forti.map(c =>
          Math.pow(c.poi.top, 4) * (c.poi.cat.includes('iconico') ? 2.5 : 1) * (0.5 + rnd())), rnd);
        if (scelta) plan.items.push({ attivitaId: scelta.poi.id });
      }
    }

    let giri = 0;
    while (plan.items.length < target - (ritmo.pranzoMin >= 30 ? 1 : 0) && giri++ < 60) {
      const cat = {};
      plan.items.forEach(i => (getAttivita(i.attivitaId).cat || []).forEach(c => cat[c] = (cat[c] || 0) + 1));

      const pool = disponibili().filter(c => c.poi.quando !== 'pranzo');
      if (!pool.length) break;

      const stato = valuta(plan);
      const pesi = pool.map(function (c) {
        const rip = (c.poi.cat || []).reduce((a, x) => a + (cat[x] || 0), 0);
        const penale = Math.pow(0.62, Math.max(0, rip - 1));
        const efficienza = Math.pow(c.poi.top || 1, 3) / Math.pow(Math.max(18, c.dMin), 0.55);
        const iconico = (c.poi.cat || []).includes('iconico') ? 1.6 : 1;
        const soldi = (c.dEur > 0 && (stato.costoResiduo - c.dEur) > 15) ? 1.25 : 1;
        /* Vicinanza: premia le attività più vicine all'alloggio, a parità di resto
           (idea premium: organizzare per distanza dal luogo di permanenza). */
        const vicinanza = 1 / Math.max(0.3, c.distanzaKm || 1);
        return efficienza * penale * iconico * soldi * Math.pow(vicinanza, 0.3) * (0.55 + rnd() * 0.9);
      });
      const scelta = pescaPesato(pool, pesi, rnd);
      if (!scelta) break;
      plan.items.splice(scelta.indice, 0, { attivitaId: scelta.poi.id });
      riparaOrari(plan);
    }

    if (ritmo.pranzoMin >= 30) {
      const pasti = disponibili().filter(c => c.poi.quando === 'pranzo');
      if (pasti.length) {
        const scelta = pescaPesato(pasti, pasti.map(c => Math.pow(c.poi.top, 2) / Math.max(20, c.dMin)), rnd);
        if (scelta) plan.items.splice(scelta.indice, 0, { attivitaId: scelta.poi.id });
      }
    }

    const ordine = { mattina: 0, pranzo: 1, qualsiasi: 2, pomeriggio: 3 };
    plan.items.sort((a, b) => (ordine[getAttivita(a.attivitaId).quando] ?? 2) - (ordine[getAttivita(b.attivitaId).quando] ?? 2));
    riparaOrari(plan);

    let guard = 0;
    while (!valuta(plan).fattibile && plan.items.length > 1 && guard++ < 20) {
      const v = valuta(plan);
      let peggiore = -1, peggioreVal = Infinity;
      plan.items.forEach(function (it, i) {
        const test = clona(plan); test.items.splice(i, 1);
        const tv = valuta(test);
        const guadagno = (v.fine - tv.fine) + (v.costo - tv.costo) * 3;
        const valore = (getAttivita(it.attivitaId).top || 1) * 40 / Math.max(1, guadagno);
        if (valore < peggioreVal) { peggioreVal = valore; peggiore = i; }
      });
      if (peggiore < 0) break;
      plan.items.splice(peggiore, 1);
    }

    return plan;
  }

  /* ============================ OTTIMIZZAZIONE PERCORSO ==================== */
  /* Idea premium 1: riordina le tappe già scelte per minimizzare il tempo totale
     di spostamento (euristica nearest-neighbor + 2-opt, non un solver TSP esatto:
     con 4-10 tappe al giorno il risultato è comunque quasi-ottimo ed è istantaneo). */
  function ottimizzaPercorso(plan) {
    const tappa = getTappa(plan.tappaId);
    const partenza = tappa.alloggio.coord;
    const items = plan.items.slice();
    if (items.length < 2) return { plan: clona(plan), risparmioMin: 0 };

    const prima = valuta(plan).fine - finestraGiorno(tappa, plan.data).inizio;

    // Nearest neighbor a partire dall'alloggio
    const rimanenti = items.slice();
    const ordinati = [];
    let pos = partenza;
    while (rimanenti.length) {
      let miglior = 0, migliorDist = Infinity;
      rimanenti.forEach((it, i) => {
        const p = getAttivita(it.attivitaId);
        const d = km(pos, p.coord);
        if (d < migliorDist) { migliorDist = d; miglior = i; }
      });
      const scelto = rimanenti.splice(miglior, 1)[0];
      ordinati.push(scelto);
      pos = getAttivita(scelto.attivitaId).coord;
    }

    // 2-opt: scambia coppie di segmenti finché non migliora più
    function lunghezzaTotale(seq) {
      let tot = 0, p = partenza;
      seq.forEach(it => { const a = getAttivita(it.attivitaId); tot += km(p, a.coord); p = a.coord; });
      tot += km(p, partenza);
      return tot;
    }
    let migliorato = true, guard = 0;
    while (migliorato && guard++ < 200) {
      migliorato = false;
      for (let i = 0; i < ordinati.length - 1; i++) {
        for (let j = i + 1; j < ordinati.length; j++) {
          const nuovo = ordinati.slice(0, i).concat(ordinati.slice(i, j + 1).reverse(), ordinati.slice(j + 1));
          if (lunghezzaTotale(nuovo) < lunghezzaTotale(ordinati) - 0.001) {
            ordinati.splice(0, ordinati.length, ...nuovo);
            migliorato = true;
          }
        }
      }
    }

    const nuovoPlan = { tappaId: plan.tappaId, data: plan.data, ritmo: plan.ritmo, items: ordinati.map(i => ({ attivitaId: i.attivitaId })) };
    riparaOrari(nuovoPlan);
    const dopo = valuta(nuovoPlan).fine - finestraGiorno(tappa, plan.data).inizio;
    return { plan: nuovoPlan, risparmioMin: Math.max(0, prima - dopo) };
  }

  /* Piano B: la stessa giornata, ridotta. */
  function pianoB(plan) {
    const b = clona(plan);
    while (b.items.length > 1) {
      const v = valuta(b);
      if (v.bufferMin >= v.bufferReq * 2.2) break;
      let peggiore = 0, min = Infinity;
      b.items.forEach(function (it, i) {
        const p = getAttivita(it.attivitaId);
        const test = clona(b); test.items.splice(i, 1);
        const risp = v.fine - valuta(test).fine;
        const rap = (p.top || 1) * 40 / Math.max(1, risp);
        if (rap < min) { min = rap; peggiore = i; }
      });
      b.items.splice(peggiore, 1);
    }
    return b;
  }

  return {
    T: T, ATTIVITA: ATTIVITA, CAT: window.CATEGORIE, RITMI: window.RITMI,
    getTappa: getTappa, getAttivita: getAttivita, attivitaDiTappa: attivitaDiTappa,
    registraAttivita: registraAttivita, eliminaAttivita: eliminaAttivita,
    finestraGiorno: finestraGiorno, bufferRichiesto: bufferRichiesto, budgetGiorno: budgetGiorno,
    valuta: valuta, candidati: candidati, miglioreInserimento: miglioreInserimento,
    genera: genera, ottimizzaPercorso: ottimizzaPercorso, pianoB: pianoB, clona: clona,
    tratta: tratta, km: km, chiusoOggi: chiusoOggi, nomeGiorno: nomeGiorno
  };
})();
