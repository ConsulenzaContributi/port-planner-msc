# Port Planner — Allegato tecnico
### MSC Meraviglia · UWSR · 26 set – 3 ott 2026 · Napoli → Napoli

> Documento di lavoro. Tutti i dati operativi (orari, navette, terminal) vanno **ri-verificati** a ridosso
> della partenza: cambiano di stagione in stagione e MSC può riassegnare gli ormeggi fino a pochi giorni prima.

---

## ⚠️ REVISIONE SCOPE — 08/08/2026

Il §2 (dossier porti) qui sotto è stato scritto prima di conoscere questi vincoli e va letto
**solo per le informazioni su ormeggi, navette e criticità**, non per i suggerimenti di visita.

**Vincoli definitivi:**
1. **Solo città di sbarco.** Niente gite fuori porta. Livorno = Livorno città (no Pisa, no Firenze,
   no Cinque Terre). Marsiglia = Marsiglia. Barcellona = Barcellona. Palermo = Palermo città
   (Monreale e Mondello **fuori scope**). La Goletta → scope da definire.
2. **Viaggiatori:** coppia, marito e moglie, senza figli. Il profilo "kids" si può eliminare dal modello.
3. **Budget:** ~€50 massimo per tappa (interpretazione esatta da confermare).
4. **Motore incrementale:** l'utente sceglie un'attrazione "ancora"; l'app propone le successive
   filtrando su **tempo residuo E budget residuo**.

**Conseguenze:**
- Il `riskScore` si semplifica molto: sparisce il rischio treno/lunga distanza per Livorno.
  Resta alto solo per La Goletta (estero, fuso −1h, taxi).
- Il **budget diventa il vincolo dominante**, non il tempo. Va modellato con la stessa serietà
  dell'all-aboard: doppio contatore parallelo (§4-bis).
- I POI da schedare cambiano: servono i POI **urbani** di ogni città, non le icone dell'entroterra.

---

## 1. Dati crociera (verificati da msccrociere.it, 08/08/2026)

| Giorno | Data | Porto | Arrivo | Partenza |
|---|---|---|---|---|
| 1 | Sab 26/09/2026 | Napoli | — | 16:30 |
| 2 | Dom 27/09/2026 | Livorno | 09:00 | 19:00 |
| 3 | Lun 28/09/2026 | Marsiglia | 10:00 | 19:00 |
| 4 | Mar 29/09/2026 | Barcellona | 08:00 | 18:00 |
| 5 | Mer 30/09/2026 | Navigazione | — | — |
| 6 | Gio 01/10/2026 | La Goletta (Tunisi) | 08:00 | 18:00 |
| 7 | Ven 02/10/2026 | Palermo | 09:00 | 18:00 |
| 8 | Sab 03/10/2026 | Napoli | 06:30 | — |

Nave: **MSC Meraviglia** · Cabine da €978 p.p. (interna) · quota servizio inclusa nel prezzo indicato (€84).

**Fuso orario:** la nave resta su ora di bordo (Europe/Rome). Marsiglia e Barcellona coincidono.
La Tunisia a ottobre è **UTC+1 senza ora legale**, mentre l'Italia è UTC+2 → **a Tunisi l'ora locale è
1 ora indietro rispetto all'ora di bordo.** Questo è il classico killer da "nave persa": l'app deve
mostrare *sempre* due orologi nella giornata di La Goletta.

---

## 2. Dossier porto per porto

Legenda rischio: 🟢 basso · 🟡 medio · 🔴 alto

### G2 · Livorno — 🔴 il giorno più rischioso
- **Ormeggio:** area commerciale del porto, non pedonalizzabile. Serve navetta fino al varco
  (Porto Varco Galvani / Piazza del Municipio), ~10 min.
- **Il punto:** Livorno città vale poco per un crocierista; il valore è tutto nell'entroterra.
  - **Pisa** — ~20 km, 25–30 min. Rientro comodo. Permette Pisa + Lucca in giornata.
  - **Firenze** — ~100 km. Treno Livorno Centrale → Firenze S.M.N. 1h20–1h30 (spesso con cambio a Pisa).
    Andata+ritorno = ~3h30–4h di puro trasferimento su 10h lorde. Netto in città: **~4h.**
  - **Cinque Terre** — sconsigliato: trasferimento troppo lungo e dipendente da coincidenze.
- **Vincolo hard:** ultimo treno utile di rientro da Firenze intorno alle 16:00–16:15 per stare
  tranquilli sul "tutti a bordo" delle 18:00–18:30.
- **Decisione che l'app deve rendere esplicita:** *Firenze in corsa* vs *Pisa+Lucca con calma*.

### G3 · Marsiglia — 🟡
- **Ormeggio:** terminal crociere a nord (zona Cap Janet / Mole Léon Gourret), ~5–6 km dal Vieux-Port.
  Navetta a pagamento fino a Joliette / Vieux-Port, 15–20 min.
- **Arrivo alle 10:00** = giornata corta reale (~7h nette in città). Non sovraccaricare.
- **Candidati:** Notre-Dame de la Garde (vista, salita ripida), Le Panier, Vieux-Port + MuCEM +
  Fort Saint-Jean, Calanques (barca da Vieux-Port), Cassis, Aix-en-Provence (~40 min).
- **⚠️ Lunedì:** in Francia molti musei civici chiudono il lunedì (il MuCEM invece chiude il martedì).
  Da verificare uno per uno — è esattamente il caso d'uso del motore vincoli.

### G4 · Barcellona — 🟡
- **Ormeggio:** Moll Adossat (terminal A–E), zona non percorribile a piedi. Navetta "Portbus"
  fino al Monumento a Colombo / World Trade Center, 10–15 min.
- **Giornata piena (10h lorde, ~8h nette).** È il porto con più densità di attrazioni a biglietto
  con **slot orario obbligatorio**: Sagrada Família, Park Güell, Casa Batlló, La Pedrera.
  Vanno prenotati **settimane prima** — l'app deve generare la lista prenotazioni con deadline.
- **Trappola classica:** Sagrada Família + Park Güell nello stesso giorno con slot scelti male
  → si passa la giornata in metro. Vanno accoppiati con slot compatibili o si sceglie uno dei due.

### G6 · La Goletta (Tunisi) — 🔴 per motivi diversi
- **Ormeggio:** La Goulette, ~12 km dal centro di Tunisi.
- **Triangolo classico:** Cartagine (siti archeologici sparsi su più recinti) + Sidi Bou Said
  (borgo bianco/blu) + Medina di Tunisi (souk, Zitouna). Museo del Bardo per gli appassionati di mosaici.
- **Trasporti:** treno leggero TGM (economico, lento, poco leggibile per uno straniero) oppure
  taxi/grand taxi da contrattare. Escursione ufficiale MSC = costosa ma copre il rischio.
- **Criticità reali da modellare nell'app:**
  - **Fuso −1h** rispetto all'ora di bordo (vedi §1).
  - **Dinaro tunisino non esportabile**, cambio solo in loco, contante quasi obbligatorio fuori dagli hotel.
  - Documenti: verificare requisiti d'ingresso per crocieristi (di norma si scende con documento
    d'identità/passaporto secondo le indicazioni della compagnia) — **da confermare con MSC.**
  - Contrattazione nei souk, forte pressione commerciale: mettere i "tips" nella scheda, non è folklore.
  - Ottobre a Tunisi: caldo secco, poca ombra a Cartagine.
- **Questa è la giornata in cui il "Piano B" e l'escursione ufficiale vanno valutati seriamente.**

### G7 · Palermo — 🟢 il miglior rapporto ore/valore
- **Ormeggio:** porto **adiacente al centro storico**. Si esce a piedi: Teatro Politeama ~10 min,
  Teatro Massimo ~15 min. Zero tempo perso in navette.
- **Candidati centro (tutto a piedi):** Cattedrale, Quattro Canti, Fontana Pretoria, Martorana,
  Palazzo dei Normanni + Cappella Palatina, mercati (Ballarò, Capo, Vucciria), street food.
- **Fuori città:** Monreale (Duomo e chiostro — ~30 min di bus/taxi), Mondello (mare).
- **⚠️ Palazzo dei Normanni:** gli Appartamenti Reali hanno aperture ridotte in alcuni giorni della
  settimana per attività dell'Assemblea Regionale. Da verificare per venerdì 2 ottobre.

---

## 3. Modello dati (JSON, tutto statico e versionabile)

### 3.1 `data/cruise.json`
```json
{
  "id": "MR20260926NAPNAP",
  "ship": "MSC Meraviglia",
  "itineraryCode": "UWSR",
  "nights": 7,
  "shipTimezone": "Europe/Rome",
  "portCalls": [
    {
      "day": 2,
      "date": "2026-09-27",
      "portId": "livorno",
      "name": "Livorno",
      "country": "IT",
      "localTimezone": "Europe/Rome",
      "arrival": "09:00",
      "departure": "19:00",
      "allAboardOffsetMin": 60,
      "disembarkBufferMin": 20,
      "tender": false,
      "berth": { "label": "Porto di Livorno – terminal crociere", "coords": [43.5556, 10.2963] },
      "gateways": [
        { "id": "shuttle-varco", "mode": "shuttle", "to": [43.5490, 10.3060],
          "durationMin": 10, "frequencyMin": 20, "cost": { "amount": 5, "currency": "EUR" },
          "note": "Navetta porto→varco, obbligatoria" },
        { "id": "walk-station", "mode": "walk", "to": "livorno-centrale", "durationMin": 25 }
      ],
      "hubs": [
        { "id": "livorno-centrale", "name": "Livorno Centrale", "coords": [43.5424, 10.3161] }
      ]
    }
  ]
}
```

### 3.2 `data/poi/<portId>.json`
```json
{
  "id": "pisa-piazza-miracoli",
  "portId": "livorno",
  "name": "Piazza dei Miracoli e Torre di Pisa",
  "categories": ["iconico", "storia", "architettura"],
  "coords": [43.7230, 10.3966],
  "hubId": "pisa-centrale",
  "visitMinutes": { "express": 45, "standard": 90, "deep": 180 },
  "opening": [{ "weekdays": [0,1,2,3,4,5,6], "from": "09:00", "to": "19:00" }],
  "closedDates": [],
  "ticket": {
    "required": true, "timedSlot": true, "bookAheadDays": 30,
    "price": { "amount": 20, "currency": "EUR" }, "url": ""
  },
  "queueMinutes": { "typical": 15, "peak": 60 },
  "effort": { "walkKm": 1.2, "steps": 251, "shade": "low" },
  "accessibility": { "wheelchair": "partial", "notes": "Torre non accessibile" },
  "suitability": { "kids": 4, "seniors": 3, "foodie": 2, "art": 5, "nature": 1 },
  "bestTime": "early",
  "tips": [],
  "photos": [],
  "lastVerified": "2026-08-08",
  "verifyBeforeTrip": true,
  "sources": []
}
```

### 3.3 `data/segments/<portId>.json` — matrice tempi pre-calcolata
Calcolata **una volta** online (OSRM / GraphHopper / orari treni) e poi **congelata** nel repo,
così l'app funziona senza rete il giorno stesso.
```json
{ "from": "berth-livorno", "to": "pisa-piazza-miracoli", "mode": "train",
  "durationMin": 55, "cost": { "amount": 4.4, "currency": "EUR" },
  "reliability": "medium", "fixedSchedule": true,
  "departures": ["09:22","09:52","10:22"],
  "note": "Navetta + treno da Livorno Centrale, cambio possibile" }
```

### 3.4 `plan.json` — l'output dell'utente (in localStorage + export file)
```json
{
  "planVersion": 3,
  "days": [
    { "date": "2026-09-27", "variant": "A",
      "items": [
        { "type": "move", "segmentId": "berth→pisa", "start": "09:20", "end": "10:15" },
        { "type": "visit", "poiId": "pisa-piazza-miracoli", "start": "10:15", "end": "11:45" },
        { "type": "meal", "label": "Pranzo", "start": "12:30", "end": "13:30" }
      ],
      "computed": { "allAboard": "18:00", "endsAt": "17:05", "bufferMin": 55, "riskScore": 0.42 } }
  ]
}
```

---

## 4. Motore di fattibilità

```
T_disponibile(giorno) = allAboard − (arrival + disembarkBufferMin)
dove allAboard = departure − allAboardOffsetMin

T_impegnato = Σ spostamenti + Σ visite + Σ code + Σ pasti/soste

FATTIBILE  ⟺  T_impegnato + BufferRichiesto ≤ T_disponibile
```

**Buffer richiesto** (non negoziabile, è la ragione d'essere dell'app):
```
buffer = max(45 min, 20% del tempo di trasferimento fuori dall'area portuale)
+ 30 min se il rientro dipende da un orario fisso (treno)
+ 20 min se il porto è in un paese extra-UE
+ 15 min per ogni cambio di mezzo oltre il secondo
```

**Risk score 0–1**, da mostrare come semaforo:
| Fattore | Peso |
|---|---|
| Buffer residuo / buffer richiesto | 0.35 |
| Distanza max dal porto | 0.20 |
| Numero di cambi di mezzo | 0.15 |
| Dipendenza da orari fissi | 0.15 |
| Attraversamento frontiera / fuso diverso | 0.10 |
| POI con slot orario rigido | 0.05 |

Il motore deve **rifiutare** un piano rosso, non solo avvisare: propone automaticamente la
variante ridotta (Piano B) togliendo il POI a più basso `suitability / minuti`.

---

## 5. Architettura

**Stack:** HTML + CSS + JS vanilla, ES modules, **nessun build step**. Apribile con doppio clic
o `python3 -m http.server`.

```
/index.html
/css/     app.css  print.css
/js/      app.js  store.js  planner.js  map.js  timeline.js  poi.js  export.js
/data/    cruise.json  poi/*.json  segments/*.json
/assets/  icons/  tiles/            ← cache mappe offline
/sw.js    /manifest.webmanifest
```

| Esigenza | MVP | Evoluzione |
|---|---|---|
| Mappa | Leaflet 1.9 + tile OSM | MapLibre GL + **PMTiles** (un singolo file per porto → offline vero) |
| Routing | matrice pre-calcolata a mano/OSRM | OSRM self-hosted in fase di build dati |
| Storage | `localStorage` | IndexedDB (tile, foto, allegati) |
| Offline | Service Worker, cache-first | + pre-download tile per bounding box porto |
| Export | JSON + `window.print()` → PDF | `.ics` per il calendario, QR per condivisione |
| Drag & drop | HTML5 Drag and Drop API | libreria sortable se serve touch fluido |

**Perché niente framework:** l'app deve funzionare tra 14 mesi, su un telefono, senza rete,
senza `npm install`. Vanilla + JSON è la scelta che invecchia meglio.

---

## 6. Le viste

1. **Panoramica crociera** — le 8 giornate a colpo d'occhio, semaforo di rischio, % completamento.
2. **Giornata (planner)** — timeline verticale drag & drop a sinistra, mappa a destra,
   barra "tempo residuo" sempre visibile in alto.
3. **Catalogo POI** — filtri per categoria, durata, distanza dal porto, adatto-a; card con foto.
4. **Scheda POI** — dettaglio completo (§3.2) + pulsante "aggiungi alla giornata".
5. **Mappa del giorno** — percorso numerato, isocrone dal porto, cerchio del "punto di non ritorno".
6. **Day Mode** — vista a schermo intero per il giorno stesso: prossimo step, countdown all-aboard,
   posizione GPS, pulsante rosso **"Torna alla nave adesso"**.
7. **Checklist & prenotazioni** — biglietti da comprare con deadline, documenti, contanti, valigia.

---

## 7. Roadmap

**Fase 0 — Dati (1 sessione).** `cruise.json` con l'itinerario reale + 8–12 POI per porto
scritti a mano bene. È il 70% del valore.

**Fase 1 — MVP navigabile.** Panoramica + catalogo POI + schede + aggiunta a giornata +
calcolo fattibilità + barra tempo residuo. Nessuna mappa ancora.

**Fase 2 — Mappa.** Leaflet, marker per POI, percorso del giorno, isocrona porto.

**Fase 3 — Planner serio.** Drag & drop, Piano A/B, risk score, ottimizzazione ordine visite.

**Fase 4 — Offline & export.** Service worker, PWA installabile, PDF stampabile, `.ics`, QR.

**Fase 5 — Rifinitura.** Meteo storico, tramonto, budget, modalità gruppo, foto.

---

## 8. Da verificare prima di partire (checklist)

- [ ] Orario "tutti a bordo" reale per ogni scalo (dal Programma del Giorno di bordo)
- [ ] Terminal assegnato e disponibilità/costo navette in ciascun porto
- [ ] Documenti richiesti per lo sbarco a La Goletta (chiedere a MSC)
- [ ] Giorni di chiusura musei: Marsiglia (lunedì), Barcellona (martedì), Palermo (venerdì)
- [ ] Slot Sagrada Família / Park Güell → prenotare ~1–2 mesi prima
- [ ] Orari treni Livorno ↔ Pisa/Firenze per domenica 27/09 (orario invernale da dicembre, ok)
- [ ] Assicurazione / numero di emergenza MSC / procedura "nave persa"
