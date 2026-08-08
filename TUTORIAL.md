# Tutorial — come funziona, passo per passo

Esempio reale e completo: **costruiamo la giornata di Palermo**, venerdì 2 ottobre.
Tutti i numeri qui sotto sono quelli che l'app calcola davvero, non esempi inventati.

---

## Passo 0 — Aprire l'app

Doppio clic su `index.html`. Oppure, da terminale:

```bash
cd "/Users/vincenzovignola/crociera Aug 26" && python3 -m http.server 8777
```

e apri `http://localhost:8777`.

Vedi la **Panoramica**: otto card, una per giornata. Ognuna mostra orario di sbarco,
orario del «tutti a bordo» e un pallino di stato. All'inizio sono tutti grigi: nessun
programma.

---

## Passo 1 — Aprire la giornata

Clicca sulla card **G7 Palermo** (o sulla linguetta in alto).

In cima compaiono i due contatori che governano tutto:

```
⏱ Tempo                                   💶 Budget
finestra 09:15 → 17:00 = 7h 45m           € 100 (50 € a testa)
6h 36m realmente spendibili               € 100 liberi
```

Perché **6h 36m** e non 7h 45m? Perché l'app ha già messo da parte il **margine di
sicurezza**: 45 minuti di base per il ritmo Medio, più il tempo di rientro a bordo.
Quel margine non lo puoi spendere. È la ragione per cui l'app esiste.

> A Palermo i costi fissi sono **€0**: la nave attracca a ridosso del centro e si esce
> a piedi. A Barcellona, per confronto, parti già con €16 di navetta bruciati.

---

## Passo 2 — Scegliere l'ancora

L'ancora è la cosa che vuoi assolutamente fare. Nel catalogo a destra cerca
**Palazzo dei Normanni e Cappella Palatina** e premi **+ Aggiungi**.

I contatori si aggiornano:

```
usate 3h 16m · spesi € 34 · restano 3h 44m e € 66
```

Le due ore di visita sono diventate 3h 16m perché l'app ha aggiunto lo spostamento
a piedi dal porto (25 minuti in salita lungo il Cassaro) e i 20 minuti di coda tipici.
I €34 sono €17 a testa per due.

---

## Passo 3 — Leggere le proposte

Da qui in poi il catalogo si filtra da solo. Ogni card mostra **quanto costa
aggiungerla**, non il suo prezzo assoluto:

| Proposta | Costo di inserimento | Dopo restano |
|---|---|---|
| Quattro Canti, Fontana Pretoria e Piazza Bellini | `+47 min` `+€0` | 2h 57m · €66 |
| Mercato del Capo | `+48 min` `+€0` | 2h 56m · €66 |
| La Martorana e San Cataldo | `+1h 04m` `+€10` | 2h 40m · €56 |
| Mercato di Ballarò | `+1h 09m` `+€0` | 2h 35m · €66 |
| Pranzo: street food palermitano | `+1h 13m` `+€24` | 2h 31m · €42 |
| Cattedrale di Palermo (tetti) | `+1h 22m` `+€24` | 2h 22m · €42 |

**Il numero da guardare è la prima colonna.** La Martorana costa €5 a testa e dura
45 minuti, ma il suo costo di inserimento è `+1h 04m`: la differenza è il cammino per
arrivarci e ripartirne. Un posto *sulla strada* costa quasi nulla in più; uno fuori
mano costa il doppio del suo tempo di visita.

---

## Passo 4 — Riempire

Aggiungi nell'ordine **Pranzo street food**, **Quattro Canti**, **La Martorana**.
Guarda come i residui scendono:

```
+ Pranzo street food      +1h 13m  +€24   →  restano 2h 31m e €42
+ Quattro Canti           +44 min  +€0    →  restano 1h 47m e €42
+ La Martorana            +1h 00m  +€10   →  restano   47 min e €32
```

Nota che i Quattro Canti sono scesi da `+47` a `+44` minuti: adesso stanno *fra* due
tappe che hai già scelto, quindi la deviazione è più corta. Il motore ricalcola tutto
a ogni aggiunta.

---

## Passo 5 — Leggere il programma

La colonna di sinistra ora mostra la giornata ora per ora:

```
09:15  🚶  Dalla nave verso Palermo · 12 min
09:53–11:53  ① Palazzo dei Normanni e Cappella Palatina   2h 00m · €34 in due
12:08–13:16  ② Pranzo: street food palermitano            1h 08m · €24 in due
13:22–14:17  ③ La Martorana e San Cataldo                    55m · €10 in due
14:21–15:01  ④ Quattro Canti e Fontana Pretoria              40m · gratis
15:28  🚢  A bordo — margine 1h 32m (minimo richiesto 45 min)
```

Semaforo **verde**, €68 su €100. L'app ha anche riordinato da sola: il pranzo è
finito a mezzogiorno e non alle 10, perché ha rispettato gli orari di apertura.

---

## Passo 6 — Le attrazioni escluse

Scorri il catalogo: quelle che non entrano restano visibili in grigio, **con il
motivo**. Non spariscono e basta:

- **Casa Batlló** → `⛔ Sfora il budget di € 48`
- **Boqueria** → `⛔ Servono 16 min in più`
- **Mercato Centrale di Livorno** → `⛔ Chiuso la domenica`

Sapere *perché* una cosa è fuori vale quanto sapere cosa è dentro: ti dice se il
problema è il tempo (togli una tappa) o il budget (togli un biglietto).

---

## Passo 7 — La scheda

Clicca su una tappa nella timeline. La scheda si apre in due modalità.

**Preparazione** — da leggere adesso, sul divano: prezzo a persona e in due, orari,
giorni di chiusura, coda tipica e di punta, link ufficiale di prenotazione, con quanti
giorni di anticipo prenotare, salta-fila, gradini, ombra, bagni.

**In visita** — da leggere lì, in piedi: i 4 punti da non perdere a caratteri grandi
e, soprattutto, il riquadro rosso:

```
Devi ripartire da qui entro le
        11:53
per essere a bordo alle 17:00 con 1h 32m di margine
```

---

## Passo 8 — Generare invece di scegliere

Se non hai voglia di comporre a mano: scegli il **ritmo** (🐢 Lento, 🚶 Medio, ⚡ Veloce)
e premi **🎲 Genera percorso**. L'app costruisce una giornata completa e sempre
fattibile. **↻ Rigenera** ne fa un'altra diversa: prova finché non ti piace.

Il ritmo si sceglie **per singola tappa**: Veloce a Barcellona che è densa, Lento a
Livorno che ha 10 ore per una città piccola.

---

## Passo 9 — Il Piano B

Premi **Piano B ridotto**: l'app toglie le tappe col peggior rapporto valore/tempo
finché il margine non raddoppia.

```
Piano B: Cappella Palatina → La Martorana → Quattro Canti
margine 2h 43m
```

Serve il giorno stesso: sbarchi in ritardo, becchi coda, piove. Un tap invece di
ripianificare sotto stress.

---

## Passo 10 — Aggiungere una tappa tua

Premi **＋ Tappa** in basso a destra. Due strade.

**Compila a mano** — funziona sempre, offline, senza nulla di installato. Nome,
coordinate, durata, prezzo, orari, categorie. Entra nel catalogo come le altre 75.

**✨ Descrivi e genera** — richiede il proxy LLM attivo (vedi sotto). Scrivi male,
tipo *«la gelateria storica vicino al porto di cui mi ha parlato mio fratello»*, e
l'assistente compila la scheda intera: coordinate, orari, prezzi, durate, cosa non
perdere, consigli. Vedi l'anteprima, poi confermi o rigeneri.

⚠️ Le schede generate nascono marcate **«da verificare»**: un modello può sbagliare
un orario o una coordinata. Controlla prima di fidarti.

---

## Passo 11 — Chiedere all'assistente

Premi **💬 Assistente**. Conosce l'itinerario, le 75 schede e i programmi che hai
costruito, quindi puoi chiedere cose specifiche:

- *«A che ora devo lasciare la Sagrada Família per essere a bordo in tempo?»*
- *«Con 100 € a coppia, conviene la Cappella Palatina o il Teatro Massimo?»*
- *«Che cosa rischio se a Tunisi prendo il taxi invece della navetta?»*

### Avviare il proxy

La chiave API **non sta mai dentro la pagina web**. Sta in `server/.env`, e la pagina
parla solo con un processo locale sulla tua macchina.

```bash
cd "/Users/vincenzovignola/crociera Aug 26/server" && npm install && node llm-proxy.mjs
```

Lascialo girare in un terminale mentre usi l'app. Senza proxy, tutto il resto
dell'app funziona lo stesso: perdi solo la generazione schede e le domande.

---

## Passo 12 — Portarselo dietro

- **Esporta** → un file JSON con tutti i programmi, orari e link di prenotazione.
- **Stampa** → una versione su carta, senza catalogo né mappa. Da mettere in tasca:
  non ha bisogno di batteria.

Tutto è salvato automaticamente nel browser: puoi chiudere e riaprire.

---

## Riassunto in una riga

> Scegli un'ancora → l'app ti dice cosa ci sta ancora dentro e quanto costa →
> componi o fai generare → controlla il semaforo → prepara il Piano B → stampa.
