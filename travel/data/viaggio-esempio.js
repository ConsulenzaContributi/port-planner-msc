/* ============================================================================
   VIAGGIO — esempio generico per collaudare il motore travel.
   A differenza della crociera, qui l'utente carica: data di partenza, data di
   arrivo, e una lista di TAPPE ciascuna con giorni di permanenza e un luogo
   di pernotto (alloggio). Il motore organizza le attività giorno per giorno
   dentro ogni tappa, cercandole nelle vicinanze dell'alloggio.

   Sostituisci questo file (o generane uno analogo dall'agente AI / dal form
   "Nuovo viaggio" in UI) per ogni viaggio reale. Struttura tenuta il più
   possibile vicina a data/cruise.js del progetto crociera, per riuso del
   motore e dei pattern.
   ============================================================================ */

window.VIAGGIO = {
  id: "roma-firenze-2026",
  nome: "Roma e Firenze",
  viaggiatori: 2,
  valuta: "EUR",
  budgetPerPersonaGiorno: 60,     // € a persona per giorno → 120 a coppia
  dataPartenza: "2026-11-02",
  dataArrivo: "2026-11-08",

  tappe: [
    /* ------------------------------------------------------------- TAPPA 1 */
    {
      id: "roma",
      ordine: 1,
      citta: "Roma",
      paese: "IT",
      bandiera: "🇮🇹",
      fuso: "Europe/Rome",
      dataInizio: "2026-11-02",
      dataFine: "2026-11-05",
      notti: 3,
      alloggio: {
        nome: "B&B Trastevere",
        coord: [41.8896, 12.4695],
        checkIn: "15:00",
        checkOut: "10:30"
      },
      rischio: "basso",
      note: "Prima tappa: giornata di arrivo più leggera, poi due giorni pieni."
    },
    /* ------------------------------------------------------------- TAPPA 2 */
    {
      id: "firenze",
      ordine: 2,
      citta: "Firenze",
      paese: "IT",
      bandiera: "🇮🇹",
      fuso: "Europe/Rome",
      dataInizio: "2026-11-05",
      dataFine: "2026-11-08",
      notti: 3,
      trasferimento: {
        daTappa: "roma",
        modo: "treno",
        minuti: 90,
        costoAndataPersona: 45,
        note: "Frecciarossa Roma Termini → Firenze S.M.N., verificare orari prima della partenza."
      },
      alloggio: {
        nome: "Hotel Centro Storico",
        coord: [43.7714, 11.2542],
        checkIn: "14:00",
        checkOut: "11:00"
      },
      rischio: "basso",
      note: "Ultima tappa: l'ultimo giorno ha solo mattina utile prima del rientro."
    }
  ]
};

/* Giorni di permanenza per ciascuna tappa: array di date ISO. La finestra
   utile di ogni giorno tiene conto di check-in/check-out sul primo e
   sull'ultimo giorno di tappa (vedi ENGINE.finestraGiorno). */
/* Aritmetica in UTC: new Date(iso) senza suffisso orario è già UTC-mezzanotte,
   e getUTCDay()/toISOString() restano coerenti qualunque sia il fuso del
   browser. Con "T00:00:00" (ora LOCALE) la data si sfasa di un giorno per chi
   apre l'app da un fuso avanti rispetto a UTC — bug reale, corretto qui. */
window.VIAGGIO.tappe.forEach(function (t) {
  const giorni = [];
  let d = new Date(t.dataInizio);
  const fine = new Date(t.dataFine);
  while (d < fine) {
    giorni.push({ data: d.toISOString().slice(0, 10), giornoSettimana: d.getUTCDay() });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  t.giorni = giorni;
});

/* Stesse categorie del progetto crociera: riuso diretto delle schede attività. */
window.CATEGORIE = [
  { id: "iconico",     nome: "Da non perdere",        icona: "★",  colore: "#d4a017" },
  { id: "arte",        nome: "Arte e musei",          icona: "🎨", colore: "#8e5ea2" },
  { id: "chiese",      nome: "Chiese e sacro",        icona: "⛪", colore: "#6b8fb5" },
  { id: "architettura",nome: "Architettura",          icona: "🏛", colore: "#4f7a6f" },
  { id: "storia",      nome: "Storia e archeologia",  icona: "🏺", colore: "#a1633a" },
  { id: "quartieri",   nome: "Quartieri e passeggiate",icona: "🚶", colore: "#5b7a99" },
  { id: "cibo",        nome: "Cibo e mercati",        icona: "🍽", colore: "#c1553c" },
  { id: "panorami",    nome: "Panorami e viste",      icona: "🌄", colore: "#3f7d8c" },
  { id: "mare",        nome: "Mare e spiagge",        icona: "🏖", colore: "#2f8f9d" },
  { id: "natura",      nome: "Parchi e natura",       icona: "🌳", colore: "#5a8f4a" },
  { id: "shopping",    nome: "Shopping e artigianato",icona: "🛍", colore: "#9a6b8e" },
  { id: "esperienze",  nome: "Esperienze",            icona: "✨", colore: "#c98b2e" }
];

window.RITMI = {
  lento:   { nome: "Lento",   icona: "🐢", durata: "lento", minPerTappa: 105, maxTappe: 5, pranzoMin: 90,
             bufferMin: 45, maxKmPiedi: 5,
             desc: "Poche cose fatte bene, tempi larghi, un pranzo vero seduti." },
  medio:   { nome: "Medio",   icona: "🚶", durata: "medio", minPerTappa: 72, maxTappe: 8, pranzoMin: 60,
             bufferMin: 30, maxKmPiedi: 8,
             desc: "Si vede molto senza correre." },
  veloce:  { nome: "Veloce",  icona: "⚡", durata: "veloce", minPerTappa: 48, maxTappe: 11, pranzoMin: 30,
             bufferMin: 20, maxKmPiedi: 13,
             desc: "Massima copertura, visite rapide." }
};
