/* ============================================================================
   MOTORE — calcolo fattibilità, doppio budget (tempo + denaro), inserimento
   incrementale e generatore automatico di percorso.
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
  const POI = [].concat(
    window.POI_napoli || [], window.POI_livorno || [], window.POI_marsiglia || [],
    window.POI_barcellona || [], window.POI_tunisi || [], window.POI_palermo || []
  );

  /* Tappe aggiunte da te — a mano o generate dall'assistente. Stessa dignità
     delle 75 di serie: entrano nel catalogo, nel motore e nel generatore. */
  const CHIAVE_CUSTOM = 'crociera-poi-custom';
  function caricaCustom() {
    try {
      const extra = JSON.parse(localStorage.getItem(CHIAVE_CUSTOM) || '[]');
      extra.forEach(p => { if (p && p.id && !POI.some(x => x.id === p.id)) { p.custom = true; POI.push(p); } });
    } catch (e) { /* storage non disponibile */ }
  }
  caricaCustom();

  const poiById = {};
  POI.forEach(p => { poiById[p.id] = p; });

  function salvaCustom() {
    try { localStorage.setItem(CHIAVE_CUSTOM, JSON.stringify(POI.filter(p => p.custom))); }
    catch (e) { /* storage non disponibile */ }
  }
  function registraPoi(p) {
    p.custom = true;
    const i = POI.findIndex(x => x.id === p.id);
    if (i >= 0) POI[i] = p; else POI.push(p);
    poiById[p.id] = p;
    salvaCustom();
    return p;
  }
  function eliminaPoi(id) {
    const i = POI.findIndex(x => x.id === id && x.custom);
    if (i < 0) return false;
    POI.splice(i, 1); delete poiById[id]; salvaCustom();
    return true;
  }

  const scaloById = {};
  CRUISE.scali.forEach(s => { scaloById[s.id] = s; });

  /* Gli scali di Napoli condividono lo stesso catalogo "napoli" */
  const chiave = s => (typeof s === 'string' ? s : s.id).split('-')[0];

  function getScalo(id) { return scaloById[id]; }
  function getPoi(id) { return poiById[id]; }
  function poiDiScalo(scaloId, includiFuoriScope) {
    const k = chiave(scaloId);
    return POI.filter(p => p.scalo === k && (includiFuoriScope || !p.fuoriScope));
  }

  /* ------------------------------------------------------------- geografia */
  function km(a, b) {
    const R = 6371, r = x => x * Math.PI / 180;
    const dLa = r(b[0] - a[0]), dLo = r(b[1] - a[1]);
    const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLo / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  /* Tempo e costo di uno spostamento urbano.
     Se data/matrix.js è presente si usano i tempi REALI di Google Maps;
     altrimenti si torna alla stima geometrica — prudente, ma pur sempre stima. */
  const mk = c => c[0].toFixed(5) + ',' + c[1].toFixed(5);
  function daMatrice(from, to, scalo) {
    const m = window.MATRIX && window.MATRIX[scalo.id];
    if (!m) return null;
    const k = mk(from) + '|' + mk(to);
    const piedi = m.piedi && m.piedi[k], mezzi = m.mezzi && m.mezzi[k];
    if (!piedi && !mezzi) return null;
    const taxiCity = scalo.id === 'tunisi';
    /* Sotto i 25 minuti a piedi si cammina: niente attesa, niente biglietto. */
    if (piedi && piedi[0] <= 25)
      return { min: piedi[0], costo: 0, modo: 'piedi', km: (piedi[1] || 0) / 1000, reale: true };
    if (mezzi && (!piedi || mezzi[0] + 6 < piedi[0]))
      return taxiCity
        ? { min: mezzi[0] + 5, costo: 12, modo: 'taxi', km: (mezzi[1] || 0) / 1000, reale: true }
        : { min: mezzi[0] + 6, costo: 5, modo: 'mezzi', km: (mezzi[1] || 0) / 1000, reale: true };
    if (piedi) return { min: piedi[0], costo: 0, modo: 'piedi', km: (piedi[1] || 0) / 1000, reale: true };
    return null;
  }

  function tratta(from, to, scalo) {
    const reale = daMatrice(from, to, scalo);
    if (reale) return reale;

    const d = km(from, to) * 1.35;                       // fattore di tortuosità urbana
    const taxiCity = scalo.id === 'tunisi';
    if (d < 0.05) return { min: 0, costo: 0, modo: 'piedi', km: 0 };
    if (d <= 2.2) return { min: Math.round(d / 4.5 * 60) + 2, costo: 0, modo: 'piedi', km: d };
    if (d <= 9) return taxiCity
      ? { min: Math.round(d / 22 * 60) + 7, costo: 12, modo: 'taxi', km: d }
      : { min: Math.round(d / 15 * 60) + 9, costo: 5, modo: 'mezzi', km: d };
    return taxiCity
      ? { min: Math.round(d / 28 * 60) + 8, costo: 18, modo: 'taxi', km: d }
      : { min: Math.round(d / 25 * 60) + 10, costo: 8, modo: 'mezzi', km: d };
  }

  /* ------------------------------------------------------- finestra del giorno */
  function finestra(s) {
    let inizio, fine;
    if (s.tipo === 'sbarco') { inizio = T.min(s.arrivo) + 90; fine = T.min('13:00'); }
    else if (s.tipo === 'imbarco') { inizio = T.min('09:30'); fine = T.min(s.partenza) - (s.allAboardMin || 60); }
    else { inizio = T.min(s.arrivo) + (s.sbarcoMin || 0); fine = T.min(s.partenza) - (s.allAboardMin || 60); }
    return { inizio, allAboard: fine, totale: fine - inizio };
  }

  /* Buffer minimo non negoziabile. È la ragione d'essere di questa app. */
  function bufferRichiesto(s, ritmoId) {
    let b = (RITMI[ritmoId] || RITMI.medio).bufferMin;
    if (s.paese && s.paese !== 'IT') b += 15;
    if (s.rischio === 'alto') b += 30;
    if (s.accesso && s.accesso.modo !== 'piedi') b += 10;
    return b;
  }

  function budgetTotale() { return CRUISE.budgetPerPersona * CRUISE.viaggiatori; }

  /* --------------------------------------------------------------- aperture */
  function chiusoOggi(p, s) { return (p.chiusoGiorni || []).indexOf(s.giornoSettimana) >= 0; }

  function codaStimata(p, oraArrivo) {
    if (!p.coda) return 0;
    const punta = oraArrivo >= T.min('10:30') && oraArrivo <= T.min('15:00');
    return punta ? Math.round((p.coda.tipica + p.coda.punta) / 2) : (p.coda.tipica || 0);
  }

  /* ============================ VALUTAZIONE DI UN PIANO ==================== */
  /* plan = { scaloId, ritmo, items:[{poiId}] }  →  oggetto completo con steps,
     tempi, costi, buffer, avvisi e fattibilità. Tutto il resto si appoggia qui. */
  function valuta(plan) {
    const s = getScalo(plan.scaloId);
    const ritmo = RITMI[plan.ritmo] || RITMI.medio;
    const f = finestra(s);
    const acc = s.accesso || { minuti: 0, costoAndataRitorno: 0, modo: 'piedi' };
    const partenzaCitta = acc.arrivoCitta || s.ormeggio.coord;

    let t = f.inizio, costo = 0, kmPiedi = 0;
    const steps = [], avvisi = [];

    if (acc.minuti > 0) {
      steps.push({ tipo: 'transfer', titolo: 'Dalla nave verso ' + s.citta, modo: acc.modo,
                   inizio: t, min: acc.minuti, costo: (acc.costoAndataRitorno || 0) * CRUISE.viaggiatori });
      t += acc.minuti;
      costo += (acc.costoAndataRitorno || 0) * CRUISE.viaggiatori;
    }

    let pos = partenzaCitta;
    plan.items.forEach(function (it) {
      const p = getPoi(it.poiId);
      if (!p) return;

      const tr = tratta(pos, p.coord, s);
      if (tr.min > 0) {
        steps.push({ tipo: 'move', titolo: 'Spostamento', modo: tr.modo, km: tr.km,
                     inizio: t, min: tr.min, costo: tr.costo });
        t += tr.min; costo += tr.costo;
        if (tr.modo === 'piedi') kmPiedi += tr.km;
      }

      /* Attesa di apertura. NON è un errore: se hai ore di margine, aspettare che
         apra un posto è una scelta legittima. È il buffer finale a dire se regge. */
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
                   coda: coda, costo: (p.prezzo || 0) * CRUISE.viaggiatori });
      t += durata + coda;
      costo += (p.prezzo || 0) * CRUISE.viaggiatori;
      kmPiedi += (p.fatica && p.fatica.km) || 0;

      if (t > chiude) avvisi.push({ liv: 'err', txt: p.nome + ' chiude alle ' + p.orari.a + ' e la visita finirebbe alle ' + T.hhmm(t) + '.' });
      if (chiusoOggi(p, s)) avvisi.push({ liv: 'err', txt: p.nome + ' è CHIUSO ' + nomeGiorno(s.giornoSettimana) + '.' });
      if (p.slot) avvisi.push({ liv: 'info', txt: p.nome + ' richiede un biglietto a fascia oraria: prenota lo slot delle ' + T.hhmm(steps[steps.length - 1].inizio) + ' circa.' });
      if (p.fuoriScope) avvisi.push({ liv: 'warn', txt: p.nome + ' è fuori dallo scope "solo città di sbarco" che hai scelto.' });

      pos = p.coord;
    });

    /* rientro */
    const back = tratta(pos, partenzaCitta, s);
    if (back.min > 0) {
      steps.push({ tipo: 'move', titolo: 'Rientro verso il punto navetta', modo: back.modo, km: back.km,
                   inizio: t, min: back.min, costo: back.costo });
      t += back.min; costo += back.costo;
      if (back.modo === 'piedi') kmPiedi += back.km;
    }
    if (acc.minuti > 0) {
      steps.push({ tipo: 'transfer', titolo: 'Rientro a bordo', modo: acc.modo, inizio: t, min: acc.minuti, costo: 0 });
      t += acc.minuti;
    }

    const bufferMin = f.allAboard - t;
    const bufferReq = bufferRichiesto(s, plan.ritmo);
    const budget = budgetTotale();

    if (kmPiedi > ritmo.maxKmPiedi)
      avvisi.push({ liv: 'warn', txt: 'Circa ' + kmPiedi.toFixed(1) + ' km a piedi: oltre i ' + ritmo.maxKmPiedi + ' km previsti dal ritmo ' + ritmo.nome + '.' });
    if (costo > budget)
      avvisi.push({ liv: 'err', txt: 'Budget sforato di € ' + (costo - budget).toFixed(0) + ' su € ' + budget + ' disponibili.' });
    if (bufferMin < bufferReq)
      avvisi.push({ liv: bufferMin < 0 ? 'err' : 'warn',
                    txt: bufferMin < 0 ? 'PIANO IMPOSSIBILE: si rientra ' + T.dur(-bufferMin) + ' DOPO il tutti a bordo.'
                                       : 'Margine di soli ' + T.dur(bufferMin) + ': ne servono almeno ' + T.dur(bufferReq) + '.' });
    (s.avvisi || []).forEach(a => avvisi.push({ liv: 'info', txt: a }));

    const ok = bufferMin >= bufferReq && costo <= budget &&
               !avvisi.some(a => a.liv === 'err');

    return {
      scalo: s, ritmo: ritmo, steps: steps, finestra: f,
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
  /* Il cuore di quello che hai chiesto: scelta un'attrazione, propone le altre
     compatibili con il tempo E il budget rimasti, con il costo di inserimento. */

  function clona(plan) { return { scaloId: plan.scaloId, ritmo: plan.ritmo, items: plan.items.map(i => ({ poiId: i.poiId })) }; }

  function miglioreInserimento(plan, poiId) {
    const base = valuta(plan);
    let best = null;
    for (let i = 0; i <= plan.items.length; i++) {
      const test = clona(plan);
      test.items.splice(i, 0, { poiId: poiId });
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

  /* Restituisce TUTTI i POI non ancora nel piano, con costo di inserimento e,
     se non entrano, il motivo esatto. Sapere perché una cosa è esclusa vale
     quanto sapere cosa è incluso. */
  function candidati(plan, opt) {
    opt = opt || {};
    const s = getScalo(plan.scaloId);
    const inPiano = {}; plan.items.forEach(i => inPiano[i.poiId] = true);
    const base = valuta(plan);

    return poiDiScalo(plan.scaloId, opt.includiFuoriScope)
      .filter(p => !inPiano[p.id])
      .map(function (p) {
        const r = { poi: p };
        if (chiusoOggi(p, s)) {
          r.escluso = 'Chiuso ' + nomeGiorno(s.giornoSettimana);
          r.dMin = null; r.dEur = (p.prezzo || 0) * CRUISE.viaggiatori;
          return r;
        }
        const ins = miglioreInserimento(plan, p.id);
        r.dMin = ins.dMin; r.dEur = ins.dEur; r.indice = ins.indice; r.val = ins.val;
        r.fattibile = ins.fattibile;
        if (!ins.fattibile) {
          const v = ins.val;
          if (v.costo > v.budget) r.escluso = 'Sfora il budget di € ' + (v.costo - v.budget).toFixed(0);
          else if (v.bufferMin < 0) r.escluso = 'Non si torna in tempo: mancherebbero ' + T.dur(-v.bufferMin);
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
  /* Greedy randomizzato: rigenerabile all'infinito, sempre fattibile.
     Il seme rende ogni "Rigenera" diverso ma riproducibile. */

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

  /* Riordina finché nessuna tappa cade fuori dai propri orari di apertura.
     Chi arriva troppo presto scivola più avanti, chi arriva a chiusura scivola indietro. */
  function riparaOrari(plan) {
    for (let pass = 0; pass < 8; pass++) {
      const v = valuta(plan);
      let mosso = false;
      for (let i = 0; i < plan.items.length; i++) {
        const p = getPoi(plan.items[i].poiId);
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

  function genera(scaloId, ritmoId, seed, opt) {
    opt = opt || {};
    const rnd = prng(seed || Math.floor(Math.random() * 1e9));
    const ritmo = RITMI[ritmoId] || RITMI.medio;
    const s = getScalo(scaloId);
    const plan = { scaloId: scaloId, ritmo: ritmoId, items: (opt.bloccati || []).map(id => ({ poiId: id })) };

    /* Quante tappe servono per RIEMPIRE davvero la giornata a questo ritmo. */
    const f = finestra(s);
    const target = Math.max(1, Math.min(ritmo.maxTappe, Math.round(f.totale / ritmo.minPerTappa)));

    const disponibili = () => candidati(plan, opt).filter(c => c.fattibile);

    /* 1 — l'ancora: il pezzo forte della giornata, scelto a caso tra i migliori */
    if (plan.items.length === 0) {
      const forti = disponibili().filter(c => (c.poi.top || 0) >= 4 && !c.poi.cat.includes('cibo'));
      if (forti.length) {
        const scelta = pescaPesato(forti, forti.map(c =>
          Math.pow(c.poi.top, 4) * (c.poi.cat.includes('iconico') ? 2.5 : 1) * (0.5 + rnd())), rnd);
        if (scelta) plan.items.push({ poiId: scelta.poi.id });
      }
    }

    /* 2 — riempimento con diversità di categoria (il pranzo lo si sceglie dopo,
           quando la giornata è abbastanza lunga da arrivarci davvero) */
    let giri = 0;
    while (plan.items.length < target - (ritmo.pranzoMin >= 30 ? 1 : 0) && giri++ < 60) {
      const cat = {};
      plan.items.forEach(i => (getPoi(i.poiId).cat || []).forEach(c => cat[c] = (cat[c] || 0) + 1));

      const pool = disponibili().filter(c => c.poi.quando !== 'pranzo');
      if (!pool.length) break;

      const stato = valuta(plan);
      const pesi = pool.map(function (c) {
        const rip = (c.poi.cat || []).reduce((a, x) => a + (cat[x] || 0), 0);
        const penale = Math.pow(0.62, Math.max(0, rip - 1));       // scoraggia i doppioni
        /* Penalità SUBLINEARE sul tempo: una giornata da 10 ore esiste proprio per
           permettersi le visite lunghe. Un esponente 1 farebbe scartare sistematicamente
           i capolavori (Sagrada, Cappella Palatina) a favore delle piazzette da 15 minuti. */
        const efficienza = Math.pow(c.poi.top || 1, 3) / Math.pow(Math.max(18, c.dMin), 0.55);
        const iconico = (c.poi.cat || []).includes('iconico') ? 1.6 : 1;
        /* Se il budget avanza, non penalizzare ciò che si paga: i soldi non spesi sono sprecati. */
        const soldi = (c.dEur > 0 && (stato.costoResiduo - c.dEur) > 15) ? 1.25 : 1;
        return efficienza * penale * iconico * soldi * (0.55 + rnd() * 0.9);
      });
      const scelta = pescaPesato(pool, pesi, rnd);
      if (!scelta) break;
      plan.items.splice(scelta.indice, 0, { poiId: scelta.poi.id });
      riparaOrari(plan);
    }

    /* 3 — il pranzo, ora che il programma è abbastanza lungo da toccare mezzogiorno */
    if (ritmo.pranzoMin >= 30) {
      const pasti = disponibili().filter(c => c.poi.quando === 'pranzo');
      if (pasti.length) {
        const scelta = pescaPesato(pasti, pasti.map(c => Math.pow(c.poi.top, 2) / Math.max(20, c.dMin)), rnd);
        if (scelta) plan.items.splice(scelta.indice, 0, { poiId: scelta.poi.id });
      }
    }

    /* 4 — ordina per momento ideale della giornata, poi ripara gli orari */
    const ordine = { mattina: 0, pranzo: 1, qualsiasi: 2, pomeriggio: 3 };
    plan.items.sort((a, b) => (ordine[getPoi(a.poiId).quando] ?? 2) - (ordine[getPoi(b.poiId).quando] ?? 2));
    riparaOrari(plan);

    /* 5 — se il riordino ha rotto qualcosa, togli l'ultimo finché non regge */
    let guard = 0;
    while (!valuta(plan).fattibile && plan.items.length > 1 && guard++ < 20) {
      const v = valuta(plan);
      let peggiore = -1, peggioreVal = Infinity;
      plan.items.forEach(function (it, i) {
        const test = clona(plan); test.items.splice(i, 1);
        const tv = valuta(test);
        const guadagno = (v.fine - tv.fine) + (v.costo - tv.costo) * 3;
        const valore = (getPoi(it.poiId).top || 1) * 40 / Math.max(1, guadagno);
        if (valore < peggioreVal) { peggioreVal = valore; peggiore = i; }
      });
      if (peggiore < 0) break;
      plan.items.splice(peggiore, 1);
    }

    return plan;
  }

  /* Piano B: la stessa giornata, ridotta, per quando qualcosa va storto. */
  function pianoB(plan) {
    const b = clona(plan);
    while (b.items.length > 1) {
      const v = valuta(b);
      if (v.bufferMin >= v.bufferReq * 2.2) break;
      let peggiore = 0, min = Infinity;
      b.items.forEach(function (it, i) {
        const p = getPoi(it.poiId);
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
    T: T, POI: POI, CAT: window.CATEGORIE, RITMI: window.RITMI,
    getScalo: getScalo, getPoi: getPoi, poiDiScalo: poiDiScalo, chiave: chiave,
    registraPoi: registraPoi, eliminaPoi: eliminaPoi,
    finestra: finestra, bufferRichiesto: bufferRichiesto, budgetTotale: budgetTotale,
    valuta: valuta, candidati: candidati, miglioreInserimento: miglioreInserimento,
    genera: genera, pianoB: pianoB, clona: clona, tratta: tratta,
    chiusoOggi: chiusoOggi, nomeGiorno: nomeGiorno
  };
})();
