# Port Planner — MSC Meraviglia · 26 set – 3 ott 2026

Webapp per organizzare le giornate a terra della crociera **UWSR** (Napoli → Livorno →
Marsiglia → Barcellona → La Goletta/Tunisi → Palermo → Napoli).

**In linea, senza installare niente:** [consulenzacontributi.github.io/port-planner-msc](https://consulenzacontributi.github.io/port-planner-msc/)

**Versione 1.0.0** — vedi [CHANGELOG.md](CHANGELOG.md) per la cronologia completa.

**Indice** — [Come si apre](#come-si-apre) · [Cosa fa](#cosa-fa) ·
[Aggiungere tappe](#aggiungere-tappe-tue) · [Assistente](#assistente-e-agente-proxy-llm) ·
[Foto e guide](#foto-tabella-di-marcia-e-guida-punto-per-punto) ·
[Email](#email-di-conferma-collegate-alla-scheda) ·
[Sul telefono](#sul-telefono-con-laccesso-google) ·
[Tempi reali](#tempi-di-percorrenza-reali-google-maps) · [File](#file) ·
[Da riverificare prima di partire](#prima-di-partire--da-riverificare)

## Come si apre

Doppio clic su `index.html`. Non serve installare niente, non serve un server, non serve internet
(tranne al primissimo caricamento, solo per le mappe).

In alternativa, con un server locale:

```bash
cd "/Users/vincenzovignola/crociera Aug 26" && python3 -m http.server 8777
```

poi apri `http://localhost:8777`.

> ⚠️ Se modifichi i file e non vedi i cambiamenti, è la cache del browser: ricarica con
> ⌘⇧R, oppure usa il server locale invece di `file://`.

## Cosa fa

**Due budget in parallelo, non uno.** Ogni giornata ha un tempo chiuso (dallo sbarco al
"tutti a bordo") e un budget chiuso (€50 a testa = €100 a coppia). Entrambi scendono insieme
e l'app blocca i piani che sforano l'uno o l'altro.

**Inserimento incrementale.** Scegli un'attrazione come *ancora*: da quel momento il catalogo
mostra solo ciò che ci sta ancora dentro, con il costo di inserimento reale — `+1h 15m`, `+€26`,
`poi restano 3h 10m e €22`. Il costo tiene conto dello spostamento da e verso le tappe già scelte,
quindi un posto *sulla strada* costa quasi nulla e uno fuori mano costa il doppio.
Le attrazioni escluse restano visibili con il motivo: *«Sfora il budget di €48»*,
*«Servono 16 min in più»*, *«Chiuso la domenica»*.

**Generatore automatico.** Tre ritmi (lento / medio / veloce) scelti **per singola tappa**.
Il generatore costruisce una giornata fattibile e la rigenera diversa a ogni clic.
Testato su 350 piani: nessuno infattibile.

**Schede attrazione in due modalità.** *Preparazione* (prezzi per persona e in due, orari,
giorni di chiusura, coda tipica e di punta, link ufficiale di prenotazione, anticipo richiesto,
salta-fila, gradini, ombra, bagni, consigli). *In visita* (cosa non perdere in 4 punti a caratteri
grandi e l'ora entro cui devi ripartire da lì per essere a bordo in tempo).

**Mappa** del percorso numerato, con le attrazioni non in programma in grigio.

## Cosa c'è dentro

| | |
|---|---|
| Schede attrazione | 75 (Napoli 6 · Livorno 15 · Marsiglia 14 · Barcellona 15 · Tunisi 11 · Palermo 14) |
| Scope | Solo città di sbarco, nessuna gita fuori porta |
| Viaggiatori | 2 (coppia, no bambini) |
| Budget | €50 a persona per tappa |

Le mete fuori scope ma raggiungibili (Sidi Bou Saïd, Cartagine) sono presenti ma **disattivate**:
si abilitano dalla casella in cima al catalogo.

## Aggiungere tappe tue

Pulsante **＋ Tappa** in basso a destra.

- **Compila a mano** — sempre disponibile, offline, senza installare niente.
- **✨ Descrivi e genera** — scrivi anche male («la pasticceria storica vicino ai
  Quattro Canti»). L'assistente **cerca su internet**, compila la scheda intera e
  **la aggiunge da solo** al catalogo, con l'elenco delle fonti consultate.
  Non devi confermare niente: se non ti convince, «Annulla, toglila».

Le tappe aggiunte entrano nel catalogo come le altre 75: costo di inserimento,
generatore automatico, mappa, export. Sono salvate nel browser e marcate
**«da verificare»**.

## Assistente e agente (proxy LLM)

La chiave API **non sta mai nella pagina web**: vive in `server/.env`
(protetto da `.gitignore`) e la pagina parla solo con un processo locale.

```bash
cd "/Users/vincenzovignola/crociera Aug 26/server" && npm install && node llm-proxy.mjs
```

Provider: **Google Gemini** (`gemini-2.5-flash`) **con ricerca web attiva** — prezzi e
orari vengono da pagine reali, non dalla memoria del modello, e le fonti tornano
insieme alla risposta. Per cambiare modello, modifica `GEMINI_MODEL` in `server/.env`.

Nella chat c'è la casella **🤖 può modificare i programmi**. Attiva (predefinito),
l'assistente non si limita a consigliare: legge il catalogo, aggiunge e toglie tappe,
rigenera una giornata, crea schede nuove. «Riempimi Palermo con ritmo medio» diventa
una giornata vera, e se una richiesta non ci sta ti dice di quanto sfora invece di
forzarla. Disattivala per tornare al solo consiglio.

Senza proxy l'app funziona lo stesso: perdi solo l'assistente e la generazione schede.

## Foto, tabella di marcia e guida punto-per-punto

**Foto sulle schede.** La maggior parte delle 76 attrazioni ha ora una foto, pescata
da Wikipedia con [tools/fetch-images.mjs](tools/fetch-images.mjs) (nessuna chiave
richiesta, nessuna immagine inventata: o l'API trova un file vero e pertinente, o la
scheda resta senza foto — mai un link morto). Rilancialo dopo aver aggiunto tappe:
`node tools/fetch-images.mjs [città]`.

**Tabella di marcia.** Accanto alla mappa di ogni giornata, una tabella con ogni
spostamento: orario, da-a, mezzo, minuti, km, costo — pensata per essere consultata
in movimento, non per essere letta come un racconto.

**Guida punto-per-punto.** Nella scheda di ogni attrazione, tab "In visita" →
**Genera la guida**: un percorso a tappe temporizzate dentro la visita stessa
("+0 min: l'emiciclo, guarda qui…", "+12 min: la facciata, guarda là…"), scritto
cercando online per dettagli specifici, non genericità. Generata una volta, resta
in cache **condivisa** tra i due viaggiatori (chi la genera per primo la crea per
entrambi) — leggibile anche senza accesso, la genera solo chi ha fatto login.

## Email di conferma collegate alla scheda

Ogni scheda ha in fondo un riquadro **«Email di conferma»**: cerca nella tua Gmail
(solo in lettura — l'app non può inviare né cancellare niente) e ti lascia agganciare
la ricevuta o il biglietto giusto alla tappa giusta. Il contenuto della mail non tocca
mai il database: restano solo oggetto, mittente e un link che riapre il messaggio vero
su Gmail. Sparisce da solo se non hai fatto l'accesso, o se il permesso è scaduto — in
quel caso basta uscire e rientrare con Google.

**Attivazione, una volta sola — due passaggi su Google Cloud Console** (progetto
collegato alle credenziali OAuth di Supabase):

1. [APIs & Services → Library](https://console.cloud.google.com/apis/library) → cerca
   **Gmail API** → Abilita.
2. [APIs & Services → OAuth consent screen → Data Access](https://console.cloud.google.com/apis/credentials/consent) →
   aggiungi lo scope `.../auth/gmail.readonly` → salva. Se l'app è ancora in modalità
   "Testing" (probabile, per un progetto a due utenti), aggiungi le vostre due email
   come **Test users** nella stessa schermata, altrimenti Google rifiuta l'accesso.

Senza questo, il riquadro resta e non dà errore: si limita a chiedere di accedere,
esattamente come se il permesso non fosse stato concesso.

## Sul telefono, con l'accesso Google

Progetto Supabase: **`port-planner`** (`ncvsthbfhfqrvfvjoybb`, regione eu-central-1,
piano gratuito). Serve a tre cose, e a nient'altro:

| | |
|---|---|
| **Accesso** | entri con il tuo account Google |
| **I dati ti seguono** | piani, ritmi e schede tue passano da PC a telefono |
| **L'assistente online** | una Edge Function sostituisce il proxy locale, che dal cellulare non esiste |

Tre tabelle (`piani`, `poi_custom`, `impostazioni`), tutte chiuse da **Row Level
Security** su `auth.uid()`: ogni riga appartiene a un utente e nessun altro la vede.
Lo schema è in [supabase/migrations](supabase/migrations/), la funzione in
[supabase/functions/assistente](supabase/functions/assistente/index.ts).

La chiave in `data/supabase.js` è la **publishable**, fatta apposta per stare in una
pagina web: a proteggere i dati è la RLS, non la segretezza di quella chiave. La
chiave Gemini invece non compare mai nel browser — vive nei secrets del progetto, e
la funzione richiede un JWT valido, quindi la può usare solo chi ha fatto l'accesso.

**Aggiungere l'app alla schermata Home.** Aprila da Safari sul telefono → Condividi →
«Aggiungi a Home». C'è un `manifest.json` e un service worker, quindi diventa
un'icona come le altre e **si apre anche senza rete** — che è la condizione del
giorno dello scalo a Tunisi.

Se togli i valori da `data/supabase.js`, o semplicemente non fai l'accesso, l'app
torna a essere quella di prima: tutto in locale, niente server.

## Tempi di percorrenza reali (Google Maps)

Di serie il motore stima gli spostamenti geometricamente. Per sostituirli con i
tempi **veri** a piedi e coi mezzi, una volta sola:

```bash
composio link google_maps
```

```bash
cd "/Users/vincenzovignola/crociera Aug 26" && node tools/build-matrix.mjs
```

Scrive `data/matrix.js`. Aggiungi `<script src="data/matrix.js"></script>` in
`index.html` prima di `js/engine.js` e il motore lo userà da solo — restando
offline il giorno dello scalo. Rigeneralo quando aggiungi tappe.

## File

```
index.html             avvio
css/app.css            stile, tema chiaro e scuro
js/engine.js           motore: fattibilità, doppio budget, inserimento, generatore
js/ui.js               interfaccia, schede, mappa, export
js/llm.js              assistente e agente: schede automatiche, domande, azioni
js/cloud.js            accesso Google, sincronizzazione, assistente online
data/supabase.js       url e chiave publishable del progetto (svuotali = solo locale)
manifest.json + sw.js  icona sulla Home e funzionamento offline
data/cruise.js         itinerario reale, navette, ritmi, categorie
data/poi-*.js          le 75 schede, una per città
data/matrix.js         tempi reali Maps (generato, opzionale)
server/llm-proxy.mjs   proxy locale Gemini — tiene la chiave fuori dal browser
server/.env            ⚠️ segreti, mai committare
supabase/functions/    la Edge Function: il gemello online del proxy
supabase/migrations/   schema del database e policy RLS (piani, poi, email collegate)
tools/build-matrix.mjs generatore della matrice tempi via Composio
tools/fetch-images.mjs aggiunge le foto alle schede, pescandole da Wikipedia
TUTORIAL.md            tutorial passo per passo con esempio reale
BRAINSTORM-tecnico.md  dossier porto per porto, modello dati, formule, roadmap
```

I dati sono file JS normali: si aprono con qualsiasi editor e si modificano a mano.

## Prima di partire — da riverificare

Ogni scheda ha un campo `verificato` e molte hanno `daVerificare: true`. Mancano 14 mesi:
prezzi, orari e terminal cambieranno.

- [ ] Orario reale del "tutti a bordo" per ogni scalo (dal Programma del Giorno di bordo)
- [ ] Terminal assegnato, esistenza e costo delle navette in ciascun porto
- [ ] Documenti richiesti per lo sbarco a La Goletta — chiedere a MSC
- [ ] Slot Sagrada Família e Park Güell → prenotare con 1–2 mesi di anticipo
- [ ] Palazzo dei Normanni, Teatro Massimo, MuCEM → verificare aperture del giorno
- [ ] Apertura del Museo del Bardo a Tunisi

## Le tre cose che l'app sa e che è facile dimenticare

1. **A Tunisi l'orologio a terra segna un'ora in meno** di quello di bordo (la Tunisia non fa
   l'ora legale). Il telefono si aggiorna da solo, la nave no. L'app mostra sempre entrambi.
2. **Il 27 settembre è domenica**: il Mercato Centrale di Livorno è chiuso, e l'app lo esclude.
3. **Il 2 ottobre è venerdì**: gli Appartamenti Reali di Palazzo dei Normanni a Palermo sono
   visitabili (da martedì a giovedì no). È il colpo di fortuna dell'itinerario.
