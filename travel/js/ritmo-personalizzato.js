/* ============================================================================
   IDEA PREMIUM 9 — Ritmo di viaggio personalizzato.

   Reale, non placeholder: usa lo storico locale delle giornate concluse
   (quante attività proposte sono state effettivamente tenute nel piano, quanti
   km a piedi si sono accumulati) per calibrare in automatico il ritmo
   suggerito di default nei prossimi viaggi. Se js/cloud.js è attivo, lo stesso
   storico si sincronizza sulla tabella Supabase "ritmo_storico"
   (supabase/migrations/0003_premium.sql), così la calibrazione persiste tra
   dispositivi diversi.

   Non modifica RITMI (lento/medio/veloce): calcola un ADATTAMENTO percentuale
   (più o meno tappe, più o meno km) da applicare sopra il ritmo scelto.
   ============================================================================ */

window.RITMO_PERSONALIZZATO = (function () {
  const CHIAVE = 'travel-ritmo-storico';

  function carica() { try { return JSON.parse(localStorage.getItem(CHIAVE) || '[]'); } catch (e) { return []; } }
  function salva(storico) {
    try { localStorage.setItem(CHIAVE, JSON.stringify(storico)); } catch (e) { /* niente */ }
    if (window.CLOUD && window.CLOUD.salvaRitmoStorico) window.CLOUD.salvaRitmoStorico(storico);
  }

  /* Da chiamare a fine giornata (o quando l'utente conferma "questa giornata
     andava bene / era troppo piena / era troppo vuota"). */
  function registraGiorno(viaggioId, data, attivitaPreviste, attivitaCompletate, kmPiedi, feedback) {
    const storico = carica();
    storico.push({ viaggioId, data, attivitaPreviste, attivitaCompletate, kmPiedi, feedback, quando: new Date().toISOString() });
    salva(storico.slice(-60));   // basta l'ultimo paio di mesi di viaggi
  }

  /* Fattore di correzione: >1 significa "questo utente regge di più del
     ritmo scelto, puoi proporgli qualche tappa in più"; <1 il contrario. */
  function fattoreCorrezione() {
    const storico = carica();
    if (storico.length < 3) return 1;                 // non abbastanza dati: nessuna correzione
    const recenti = storico.slice(-10);
    const rapportoCompletamento = recenti.reduce((a, g) => a + (g.attivitaPreviste ? g.attivitaCompletate / g.attivitaPreviste : 1), 0) / recenti.length;
    const feedbackNumerico = recenti.map(g => g.feedback === 'troppo_pieno' ? -1 : g.feedback === 'troppo_vuoto' ? 1 : 0);
    const mediaFeedback = feedbackNumerico.reduce((a, b) => a + b, 0) / feedbackNumerico.length;
    let fattore = 1 + (rapportoCompletamento - 1) * 0.5 + mediaFeedback * 0.12;
    return Math.max(0.7, Math.min(1.3, fattore));
  }

  /* Applica la correzione a un ritmo di ENGINE.RITMI senza mutarlo. */
  function ritmoCalibrato(ritmoId) {
    const base = window.RITMI[ritmoId] || window.RITMI.medio;
    const f = fattoreCorrezione();
    return Object.assign({}, base, {
      maxTappe: Math.max(1, Math.round(base.maxTappe * f)),
      maxKmPiedi: +(base.maxKmPiedi * f).toFixed(1),
      _fattoreApplicato: f
    });
  }

  return { registraGiorno, fattoreCorrezione, ritmoCalibrato, storico: carica };
})();
