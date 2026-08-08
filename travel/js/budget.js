/* ============================================================================
   IDEA PREMIUM 2 — Budget tracker.
   Voci di spesa extra (alloggio, trasporti, assicurazione...) non legate a
   una singola attività del catalogo. Si sommano al costo delle attività
   pianificate (già calcolato da ENGINE.valuta) per dare il totale reale del
   viaggio, mostrato nel pannello "💰 Budget" di js/ui.js.

   Persistenza: localStorage in locale; se js/cloud.js è attivo, sincronizza
   anche sulla tabella Supabase "budget_voci" (vedi supabase/migrations/0003).
   ============================================================================ */

window.BUDGET = (function () {
  const CHIAVE = 'travel-budget-' + (window.VIAGGIO ? window.VIAGGIO.id : 'default');
  let voci = [];

  function carica() {
    try { voci = JSON.parse(localStorage.getItem(CHIAVE) || '[]'); } catch (e) { voci = []; }
  }
  function salva() {
    try { localStorage.setItem(CHIAVE, JSON.stringify(voci)); } catch (e) { /* niente */ }
    if (window.CLOUD && window.CLOUD.salvaBudget) window.CLOUD.salvaBudget(voci);
  }
  carica();

  function aggiungi(descrizione, importo, categoria, tappaId, data) {
    voci.push({ descrizione: descrizione, importo: +importo || 0, categoria: categoria || 'altro', tappaId: tappaId || null, data: data || null });
    salva();
  }
  function rimuovi(indice) {
    voci.splice(indice, 1);
    salva();
  }
  function totale() { return voci.reduce((a, v) => a + (+v.importo || 0), 0); }

  return { voci: () => voci.slice(), aggiungi, rimuovi, totale };
})();
