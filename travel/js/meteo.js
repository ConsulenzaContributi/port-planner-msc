/* ============================================================================
   IDEA PREMIUM 3 — Meteo integrato nella pianificazione.

   PLACEHOLDER: nessuna chiave API configurata. window.METEO.previsione()
   restituisce dati finti ma nello stesso shape che avrebbe una risposta vera,
   così il resto dell'app (candidati indoor/outdoor, avvisi nel motore) può
   essere sviluppato e testato subito.

   PER ATTIVARE DAVVERO IL METEO:
   1. Scegli un provider (Open-Meteo è gratuito e senza chiave: https://open-meteo.com,
      oppure OpenWeatherMap/WeatherAPI con chiave).
   2. Sostituisci previsioneReale() sotto con una vera fetch al provider scelto,
      usando le coordinate dell'alloggio della tappa (tappa.alloggio.coord) e
      la data del giorno.
   3. Se il provider richiede una chiave segreta, passa dalla stessa Edge
      Function dell'assistente (supabase/functions/assistente) invece di
      esporla nel client, come già fatto per GEMINI_API_KEY.
   ============================================================================ */

window.METEO = (function () {
  const CACHE = {};

  /* Stima deterministica ma variabile per dare risultati plausibili in demo,
     SENZA pretendere di essere una previsione vera. Da sostituire (vedi sopra). */
  function previsionePlaceholder(coord, data) {
    const seme = Math.abs(Math.round((coord[0] * 1000 + coord[1] * 1000) + new Date(data).getTime() / 86400000));
    const r = (seme * 9301 + 49297) % 233280 / 233280;
    const condizioni = ['sereno', 'poco nuvoloso', 'nuvoloso', 'pioggia debole', 'pioggia'];
    const idx = Math.min(condizioni.length - 1, Math.floor(r * condizioni.length));
    return {
      data: data, fonte: 'PLACEHOLDER — non è una previsione reale',
      condizione: condizioni[idx],
      pioggiaProbabile: idx >= 3,
      tempMinC: Math.round(10 + r * 15), tempMaxC: Math.round(18 + r * 15)
    };
  }

  async function previsione(coord, data) {
    const k = coord.join(',') + '|' + data;
    if (CACHE[k]) return CACHE[k];
    const p = previsionePlaceholder(coord, data);   // sostituire con fetch reale
    CACHE[k] = p;
    return p;
  }

  /* Usata dal motore/UI per segnalare quando conviene spostare un'attività
     outdoor su un'altra fascia, o proporre un'alternativa indoor. */
  function suggerimentoPer(attivita, meteo) {
    const outdoor = (attivita.cat || []).some(c => ['panorami', 'natura', 'mare', 'quartieri'].includes(c));
    if (outdoor && meteo.pioggiaProbabile)
      return { liv: 'warn', txt: attivita.nome + ' è un\'attività all\'aperto: possibile pioggia (' + meteo.condizione + '). Considera un\'alternativa indoor o spostala.' };
    return null;
  }

  return { previsione, suggerimentoPer };
})();
