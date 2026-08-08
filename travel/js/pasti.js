/* ============================================================================
   IDEA PREMIUM 8 — Suggerimenti "cosa mangiare qui" contestuali.

   Reale: usa lo stesso motore (ENGINE.candidati) filtrando per categoria
   "cibo", orario del pasto più vicino nel piano, distanza dalla prossima
   attività (o dall'ultima inserita) e budget residuo della giornata.
   Non richiede API esterne: lavora sul catalogo già presente (statico o,
   in futuro, popolato dalla ricerca dinamica Places).
   ============================================================================ */

window.PASTI = (function () {
  const E = window.ENGINE, T = E.T;

  const FASCE = [
    { nome: 'colazione', da: '07:00', a: '10:00' },
    { nome: 'pranzo', da: '12:00', a: '14:30' },
    { nome: 'cena', da: '19:00', a: '22:00' }
  ];

  function fasciaPer(minutiGiorno) {
    return FASCE.find(f => minutiGiorno >= T.min(f.da) && minutiGiorno <= T.min(f.a)) || null;
  }

  /* Suggerisce dove mangiare vicino al punto in cui si trova il piano in
     quel momento (ultima attività inserita, o alloggio se il piano è vuoto),
     tenendo conto di quanto budget resta nella giornata. */
  function suggerisci(plan, opt) {
    opt = opt || {};
    const tappa = E.getTappa(plan.tappaId);
    const v = E.valuta(plan);
    const ultimoStep = v.steps.filter(s => s.tipo === 'visit').slice(-1)[0];
    const puntoAttuale = ultimoStep ? ultimoStep.poi.coord : tappa.alloggio.coord;
    const oraAttuale = v.fine;
    const fascia = fasciaPer(oraAttuale);

    const candidatiCibo = E.candidati(plan, { raggioKm: opt.raggioKm })
      .filter(c => c.poi.cat.includes('cibo') || c.poi.quando === (fascia && fascia.nome === 'pranzo' ? 'pranzo' : c.poi.quando))
      .map(c => ({ ...c, distanzaDaPuntoAttuale: E.km(puntoAttuale, c.poi.coord) }))
      .sort((a, b) => {
        if (a.fattibile !== b.fattibile) return a.fattibile ? -1 : 1;
        return a.distanzaDaPuntoAttuale - b.distanzaDaPuntoAttuale;
      });

    return {
      fasciaCorrente: fascia ? fascia.nome : 'fuori pasto',
      budgetResiduoGiorno: v.costoResiduo,
      suggerimenti: candidatiCibo.slice(0, 5).map(c => ({
        id: c.poi.id, nome: c.poi.nome, prezzoPP: c.poi.prezzo || 0,
        distanzaKm: +c.distanzaDaPuntoAttuale.toFixed(2), fattibile: !!c.fattibile, escluso: c.escluso || null
      }))
    };
  }

  return { suggerisci, fasciaPer };
})();
