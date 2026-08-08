# Travel Planner

Generalizzazione di **Port Planner** (il progetto crociera in questo stesso repository) a itinerari di viaggio qualsiasi: data di partenza, data di arrivo, più **tappe** ciascuna con i propri **giorni di permanenza** e un **alloggio**. Il motore riempie ogni giorno con attività vicine al luogo di pernotto, dentro il tempo e il budget disponibili — con l'aiuto di un agente AI.

Stessa filosofia del progetto crociera: **vanilla JS, nessun build step**, funziona offline, si apre con doppio clic o con un server statico qualsiasi.

## Avvio rapido

```bash
cd travel
python3 -m http.server 8778
```

Poi apri `http://localhost:8778`. Senza configurare Supabase (vedi sotto), l'app funziona lo stesso in locale con `localStorage`: niente sync cloud, niente assistente AI, niente Gmail.

## Struttura

```
travel/
  data/
    viaggio-esempio.js     ← il viaggio: date, tappe, alloggi (sostituiscilo con il tuo)
    attivita-roma.js        ← catalogo attività per tappa (uno per tappa)
    attivita-firenze.js
    supabase.js             ← config del progetto Supabase (vuota di default)
  js/
    engine.js               ← motore: fattibilità, budget, generatore, ottimizzatore percorso
    ui.js                   ← interfaccia: panoramica, vista giorno, catalogo
    llm.js                  ← assistente AI (chat + agente che modifica i programmi)
    cloud.js                ← login Google, sync, Gmail
    budget.js                    idea premium 2 — budget tracker
    meteo.js                     idea premium 3 — meteo (PLACEHOLDER)
    export.js                    idea premium 7 — PDF / .ics per calendario
    prenotazioni.js               idea premium 6 — prenotazioni (PLACEHOLDER)
    voce.js                      idea premium 10 — assistente vocale in loco
    ritmo-personalizzato.js      idea premium 9 — calibrazione ritmo da storico
    pasti.js                     idea premium 8 — suggerimenti pasto contestuali
  supabase/
    migrations/              ← schema DB (progetto separato da quello di Port Planner)
    functions/assistente/    ← Edge Function con l'agente AI (Gemini)
```

## Come sono organizzate le 10 idee premium

| # | Idea | File | Stato |
|---|------|------|-------|
| 1 | Ottimizzazione automatica del percorso | `js/engine.js` → `ottimizzaPercorso()` | ✅ reale (nearest-neighbor + 2-opt) |
| 2 | Budget tracker | `js/budget.js` | ✅ reale |
| 3 | Meteo integrato | `js/meteo.js` | 🧪 placeholder — serve un provider (vedi sotto) |
| 4 | Modalità offline + mappe | `sw.js` | ⚠️ parziale — cache incidentale, manca il download proattivo dell'area |
| 5 | Collaborazione multiutente | `supabase/migrations/0003_premium.sql`, `js/cloud.js` | 🧪 placeholder — richiede il viaggio salvato in DB, non solo nel file |
| 6 | Prenotazioni integrate | `js/prenotazioni.js` | 🧪 placeholder — serve un partner (GetYourGuide/Tiqets/TheFork) |
| 7 | Export PDF / Calendario | `js/export.js` | ✅ reale (PDF via stampa, .ics standard) |
| 8 | Suggerimenti pasto contestuali | `js/pasti.js` | ✅ reale |
| 9 | Ritmo di viaggio personalizzato | `js/ritmo-personalizzato.js` | ✅ reale (calibrazione da storico locale) |
| 10 | Assistente vocale in loco | `js/voce.js` | 🧪 parziale — voce e GPS reali, ricerca "vicino ora" ancora sul catalogo statico |

Ogni file placeholder ha in cima un commento con i passi esatti per attivarlo davvero (provider da scegliere, dove mettere la chiave, cosa sostituire).

## Setup Supabase (opzionale, per cloud + assistente AI + Gmail)

1. Crea un **nuovo progetto Supabase** (separato da quello di Port Planner).
2. Applica le migrazioni in ordine: `0001_travel_schema.sql`, `0002_email_collegate.sql`, `0003_premium.sql`.
3. Distribuisci `supabase/functions/assistente/` come Edge Function, con il secret `GEMINI_API_KEY` (e opzionalmente `GEMINI_MODEL`).
4. Compila `data/supabase.js` con `url` e `chiave` del tuo progetto.
5. Nel pannello Auth di Supabase, abilita il provider Google e aggiungi lo scope `gmail.readonly` se vuoi la ricerca email collegata alle attività.

## Cosa manca ancora (rispetto a un prodotto finito)

- **Ricerca dinamica delle attività**: oggi il catalogo (`data/attivita-*.js`) è statico, scritto a mano o generato dall'agente AI voce per voce. Per tappe arbitrarie serve una ricerca live (Google Places Nearby Search / Composio) centrata sull'alloggio, con caching in `attivita_custom`.
- **Mappa**: il progetto crociera usa Leaflet per disegnare la giornata; qui non è ancora integrata (la UI mostra solo la timeline testuale). Il motore espone già tutte le coordinate necessarie.
- **"Nuovo viaggio" da form**: oggi un viaggio si crea editando `data/viaggio-esempio.js` a mano (o generandolo con l'agente AI in chat). Un form che scrive direttamente nella tabella `viaggi`/`tappe` è il prerequisito per: collaborazione multiutente reale (idea 5), gestione di più viaggi in parallelo nella stessa UI, storico ritmo legato a un vero `viaggio_id`.
- **Download offline esplicito delle mappe** (idea 4): oggi `sw.js` mette in cache solo le tessere già viste scorrendo; un pulsante "scarica quest'area prima di partire" richiede di enumerare le tessere del riquadro a più livelli di zoom.
