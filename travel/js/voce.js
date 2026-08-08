/* ============================================================================
   IDEA PREMIUM 10 — Assistente vocale in loco.

   La parte "vocale" è reale: usa la Web Speech API del browser (SpeechRecognition),
   supportata su Chrome/Edge desktop e Android, non su tutti gli iOS/Safari —
   verificalo prima di contarci come feature primaria. La geolocalizzazione
   live è reale (navigator.geolocation). La RICERCA "cosa c'è vicino ora" è
   invece un PLACEHOLDER: usa il catalogo statico locale invece di interrogare
   Google Places in tempo reale.

   PER ATTIVARE DAVVERO LA RICERCA LIVE:
   Collega questa funzione allo stesso modulo che dovrà sostituire il catalogo
   statico (vedi TODO in data/attivita-*.js e task "ricerca dinamica attività"
   nel README) — una Google Places Nearby Search centrata sulla posizione GPS
   corrente invece che sull'alloggio della tappa.
   ============================================================================ */

window.VOCE = (function () {
  const E = window.ENGINE;
  let riconoscimento = null;
  const supportato = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  function posizioneCorrente() {
    return new Promise(function (resolve, reject) {
      if (!navigator.geolocation) return reject(new Error('Geolocalizzazione non supportata dal browser.'));
      navigator.geolocation.getCurrentPosition(
        pos => resolve([pos.coords.latitude, pos.coords.longitude]),
        err => reject(new Error('Posizione non disponibile: ' + err.message)),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  /* PLACEHOLDER: cerca nel catalogo locale della tappa attiva invece che via
     Google Places sulla posizione GPS reale (che potrebbe essere fuori tappa,
     es. mentre ci si sposta tra un'attività e l'altra). */
  async function viciniAMe(raggioKm) {
    const pos = await posizioneCorrente();
    const t = window.APPSTATE && E.getTappa(window.APPSTATE.tappaId);
    if (!t) return [];
    return E.attivitaDiTappa(t.id)
      .map(p => ({ poi: p, distanzaKm: E.km(pos, p.coord) }))
      .filter(x => x.distanzaKm <= (raggioKm || 1))
      .sort((a, b) => a.distanzaKm - b.distanzaKm);
  }

  function ascolta(onRisultato, onErrore) {
    if (!supportato) { onErrore && onErrore(new Error('Riconoscimento vocale non supportato su questo browser.')); return; }
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    riconoscimento = new R();
    riconoscimento.lang = 'it-IT';
    riconoscimento.interimResults = false;
    riconoscimento.onresult = e => onRisultato(e.results[0][0].transcript);
    riconoscimento.onerror = e => onErrore && onErrore(new Error('Errore riconoscimento: ' + e.error));
    riconoscimento.start();
  }
  function ferma() { if (riconoscimento) riconoscimento.stop(); }

  return { supportato, posizioneCorrente, viciniAMe, ascolta, ferma };
})();
