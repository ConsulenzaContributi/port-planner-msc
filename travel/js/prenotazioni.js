/* ============================================================================
   IDEA PREMIUM 6 — Prenotazioni integrate con conferma automatica.

   PLACEHOLDER: nessun partner di prenotazione collegato. window.PRENOTAZIONI
   espone lo stesso shape che avrebbe un'integrazione vera (es. GetYourGuide,
   Tiqets, TheFork per i ristoranti), così l'UI e l'agente AI possono già
   usarla; verificaDisponibilita() e crea() oggi restituiscono dati finti e
   non chiamano nessun servizio esterno.

   PER ATTIVARE DAVVERO LE PRENOTAZIONI:
   1. Scegli un partner con API di affiliazione (GetYourGuide Partner API,
      Tiqets API, TheFork API sono le più comuni per attività/ristoranti).
   2. La chiave del partner NON va nel client: passa dalla Edge Function
      dell'assistente (stesso pattern di GEMINI_API_KEY nei secrets Supabase),
      esponendo una nuova azione "prenota" che il client chiama.
   3. Aggiungi all'agente AI (supabase/functions/assistente/index.ts) uno
      strumento "crea_prenotazione" che chiama quella azione, seguendo lo
      stesso schema di crea_scheda.
   4. Sostituisci le due funzioni sotto con vere chiamate fetch() a quella
      azione invece dei dati finti.
   ============================================================================ */

window.PRENOTAZIONI = (function () {

  async function verificaDisponibilita(attivita, data, persone) {
    // PLACEHOLDER — nessuna chiamata reale.
    return {
      attivitaId: attivita.id, data: data, persone: persone,
      disponibile: !attivita.slot || Math.random() > 0.2,
      prezzoStimatoPP: attivita.prezzo || 0,
      fonte: 'PLACEHOLDER — nessun partner collegato, verifica manualmente'
    };
  }

  async function crea(attivita, data, persone) {
    const disp = await verificaDisponibilita(attivita, data, persone);
    if (!disp.disponibile) return { ok: false, motivo: 'Non disponibile in questa data (dato simulato).' };
    return {
      ok: true, riferimento: 'DEMO-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      nota: 'Prenotazione SIMULATA: nessun servizio esterno è stato contattato. ' +
            'Configura un partner reale (vedi commento in cima al file) prima di usarla in produzione.'
    };
  }

  return { verificaDisponibilita, crea };
})();
