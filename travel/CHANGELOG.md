# Changelog

Registro delle versioni di Travel Planner.

## [1.0.0] — 2026-08-08

Prima versione: generalizzazione di Port Planner (crociera) a itinerari di
viaggio multi-tappa qualsiasi.

### Motore e pianificazione
- Modello dati generico: viaggio → tappe (ognuna con giorni di permanenza e
  un alloggio) → giorni, al posto della crociera fissa a scali singoli.
- Motore adattato: finestra utile per giorno (check-in/check-out, arrivo
  da trasferimento), doppio budget tempo+denaro per giornata, inserimento
  incrementale con costo di detour reale, generatore automatico sui tre ritmi.
- **Ottimizzazione del percorso**: riordino delle attività scelte con
  nearest-neighbor + 2-opt per minimizzare gli spostamenti, con stima del
  tempo risparmiato.
- Filtro per raggio massimo dall'alloggio, sia manuale sia usato dal
  generatore automatico.

### Idee premium
- **Budget tracker**: voci di spesa extra (alloggio, trasporti...) sommate
  al costo delle attività pianificate, con confronto al budget stimato del
  viaggio.
- **Export**: itinerario stampabile in PDF (via stampa browser) ed export
  in formato `.ics` per Google Calendar / Apple Calendar / Outlook.
- **Suggerimenti pasto contestuali**: propone dove mangiare in base a
  fascia oraria, distanza dal punto in cui ci si trova nel piano e budget
  residuo della giornata.
- **Ritmo di viaggio personalizzato**: calibrazione automatica del numero
  di tappe/giorno e dei km a piedi a partire dallo storico delle giornate
  passate.
- Meteo, prenotazioni, collaborazione multiutente e assistente vocale in
  loco: presenti come moduli funzionanti nella parte locale (geolocalizzazione,
  voce, calcoli), con le sole integrazioni esterne (provider meteo, partner
  di prenotazione, viaggio salvato in DB) documentate come placeholder da
  attivare — vedi [README.md](README.md#come-sono-organizzate-le-10-idee-premium).

### Assistente e agente
- Stessa architettura di Port Planner (Gemini + function-calling + ricerca
  web), con prompt e strumenti generalizzati a tappa+giorno invece che a
  scalo: `pianifica_giorno`, `ottimizza_percorso`, `cerca_catalogo` con
  filtro per raggio dall'alloggio.

### Infrastruttura
- Progetto Supabase dedicato ("Travel", `tevaelqvvxihauykjbkr`), schema e
  Row Level Security separati da quello di Port Planner.
- Pubblicato su GitHub Pages, stesso repository di Port Planner:
  [consulenzacontributi.github.io/port-planner-msc/travel](https://consulenzacontributi.github.io/port-planner-msc/travel/).
- PWA installabile, funzionante offline (cache incidentale delle tessere
  mappa già viste).
