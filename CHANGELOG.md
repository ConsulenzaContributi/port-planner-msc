# Changelog

Registro delle versioni di Port Planner. Le date sono quelle di pubblicazione,
non quelle del viaggio (26 set – 3 ott 2026).

## [1.0.0] — 2026-08-08

Prima versione completa e pubblicata. Utilizzabile per pianificare davvero
la crociera, in locale o online.

### Motore e pianificazione
- Motore di fattibilità a doppio budget: tempo (dallo sbarco al "tutti a
  bordo") e denaro (50 € a persona / 100 € a coppia per tappa), entrambi
  chiusi e verificati insieme.
- Inserimento incrementale con costo reale di detour: scegli un'attrazione
  come ancora, l'app mostra solo cosa ci sta ancora dentro.
- Generatore automatico su tre ritmi (lento / medio / veloce), scelto per
  singola tappa. Testato su centinaia di piani generati: zero infattibili.
- Tempi di spostamento **reali** da Google Maps (via Composio), 2230 tratte
  a piedi e coi mezzi per le 76 attrazioni — non più solo stima geometrica.
  Congelati in `data/matrix.js`, l'app resta offline il giorno dello scalo.
- Piano B: riduzione automatica quando un piano non regge.

### Contenuti
- 76 schede attrazione su sei città (Napoli, Livorno, Marsiglia, Barcellona,
  Tunisi, Palermo), con prezzi, orari, code, prenotazioni, salta-fila.
- Foto su gran parte delle schede, pescate da Wikipedia (mai inventate).
- Tabella di marcia accanto alla mappa: ogni spostamento con orario, tratta,
  mezzo, minuti, km, costo.
- Guida punto-per-punto alla visita, generata via API con ricerca web,
  in cache condivisa tra i due viaggiatori.

### Assistente e agente
- Assistente Gemini con ricerca web: risponde a domande sull'itinerario,
  compila schede nuove cercando online, cita le fonti.
- Modalità agente: può leggere e modificare davvero i programmi (aggiungere,
  togliere, rigenerare una giornata), rispettando sempre il vincolo del
  "tutti a bordo" — se una richiesta non ci sta, lo dice invece di forzarla.
- Email di conferma: cerca nella Gmail dell'utente (sola lettura) e collega
  ricevute/biglietti alla scheda giusta.

### Infrastruttura
- Pubblicato su GitHub Pages, accessibile da chiunque abbia il link.
- Sincronizzazione su Supabase con login Google: i piani seguono l'utente
  da dispositivo a dispositivo, protetti da Row Level Security.
- PWA installabile sulla schermata Home, funzionante offline.
- Proxy locale (`server/llm-proxy.mjs`) come alternativa alla Edge Function
  per l'uso senza account.
