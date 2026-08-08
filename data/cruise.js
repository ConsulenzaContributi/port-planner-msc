/* ============================================================================
   CROCIERA — MSC Meraviglia · UWSR · 26 set – 3 ott 2026 · Napoli → Napoli
   Dati verificati da msccrociere.it il 08/08/2026.
   ATTENZIONE: orari, terminal, navette e costi vanno RIVERIFICATI prima della
   partenza. Ogni campo "daVerificare: true" è una cosa che cambierà.
   ============================================================================ */

window.CRUISE = {
  id: "MR20260926NAPNAP",
  nave: "MSC Meraviglia",
  itinerario: "UWSR",
  notti: 7,
  fusoNave: "Europe/Rome",
  viaggiatori: 2,
  budgetPerPersona: 50,          // € a persona per tappa → 100 a coppia
  scali: [

    /* ---------------------------------------------------------------- G1 */
    {
      id: "napoli-imbarco",
      giorno: 1,
      data: "2026-09-26",
      giornoSettimana: 6,          // 0=dom … 6=sab
      citta: "Napoli",
      paese: "IT",
      bandiera: "🇮🇹",
      fuso: "Europe/Rome",
      offsetOreDaBordo: 0,
      tipo: "imbarco",
      arrivo: null,
      partenza: "16:30",
      allAboardMin: 60,            // "tutti a bordo" = partenza − 60 min
      sbarcoMin: 0,
      note: "Giornata di imbarco. Il check-in apre di norma a metà mattina: " +
            "la finestra utile in città è ridotta e dipende da quando lasci i bagagli. " +
            "Considera il terminal come punto di partenza e di rientro.",
      ormeggio: { nome: "Stazione Marittima, Molo Angioino", coord: [40.8395, 14.2588] },
      accesso: {
        modo: "piedi",
        descrizione: "La Stazione Marittima è in centro. Piazza Municipio a 5 min a piedi.",
        minuti: 8,
        costoAndataRitorno: 0,
        daVerificare: false
      },
      rischio: "medio",
      rischioNota: "Il rischio qui non è la nave, è il traffico verso il porto e la coda al check-in."
    },

    /* ---------------------------------------------------------------- G2 */
    {
      id: "livorno",
      giorno: 2,
      data: "2026-09-27",
      giornoSettimana: 0,          // DOMENICA
      citta: "Livorno",
      paese: "IT",
      bandiera: "🇮🇹",
      fuso: "Europe/Rome",
      offsetOreDaBordo: 0,
      tipo: "scalo",
      arrivo: "09:00",
      partenza: "19:00",
      allAboardMin: 60,
      sbarcoMin: 20,
      note: "Scalo su Livorno città (nessuna gita fuori porta). 10 ore sono TANTE per Livorno: " +
            "il rischio qui non è restare corti, è restare lunghi. Prevedi un pranzo vero.",
      avvisi: [
        "È DOMENICA: il Mercato Centrale delle Vettovaglie è chiuso. Molti negozi pure.",
        "Il porto è area industriale: serve la navetta fino al varco, non si esce a piedi."
      ],
      ormeggio: { nome: "Porto di Livorno – terminal crociere", coord: [43.5556, 10.2963] },
      accesso: {
        modo: "navetta",
        descrizione: "Navetta dal terminal al varco porto / Piazza del Municipio, ~10 min. " +
                     "Da lì il centro è tutto a piedi.",
        minuti: 12,
        costoAndataRitorno: 10,     // € a persona, STIMA
        arrivoCitta: [43.5497, 10.3080],
        daVerificare: true
      },
      rischio: "basso",
      rischioNota: "Città compatta, tutto a piedi, nave vicina. Giornata tranquilla."
    },

    /* ---------------------------------------------------------------- G3 */
    {
      id: "marsiglia",
      giorno: 3,
      data: "2026-09-28",
      giornoSettimana: 1,          // LUNEDÌ
      citta: "Marsiglia",
      paese: "FR",
      bandiera: "🇫🇷",
      fuso: "Europe/Paris",
      offsetOreDaBordo: 0,
      tipo: "scalo",
      arrivo: "10:00",
      partenza: "19:00",
      allAboardMin: 60,
      sbarcoMin: 20,
      note: "Arrivo tardi (10:00) e terminal lontano: la giornata reale in città è ~7h. " +
            "Non sovraccaricare. Marsiglia si gode camminando.",
      avvisi: [
        "È LUNEDÌ: in Francia molti musei civici chiudono il lunedì. Il MuCEM invece è aperto (chiude il martedì).",
        "Il terminal crociere è a nord, ~6 km dal Vieux-Port: navetta obbligatoria."
      ],
      ormeggio: { nome: "Terminal crociere Cap Janet / Mole Léon Gourret", coord: [43.3480, 5.3450] },
      accesso: {
        modo: "navetta",
        descrizione: "Navetta dal terminal a Joliette / Vieux-Port, 15–20 min secondo il traffico.",
        minuti: 20,
        costoAndataRitorno: 14,     // € a persona, STIMA
        arrivoCitta: [43.2965, 5.3698],
        daVerificare: true
      },
      rischio: "medio",
      rischioNota: "Navetta dipendente dal traffico. Tieni 45 min di margine sul rientro."
    },

    /* ---------------------------------------------------------------- G4 */
    {
      id: "barcellona",
      giorno: 4,
      data: "2026-09-29",
      giornoSettimana: 2,          // MARTEDÌ
      citta: "Barcellona",
      paese: "ES",
      bandiera: "🇪🇸",
      fuso: "Europe/Madrid",
      offsetOreDaBordo: 0,
      tipo: "scalo",
      arrivo: "08:00",
      partenza: "18:00",
      allAboardMin: 60,
      sbarcoMin: 20,
      note: "La giornata più piena e la più densa di biglietti a slot orario. " +
            "Qui la pianificazione anticipata vale davvero: gli slot vanno presi con mesi di anticipo.",
      avvisi: [
        "È MARTEDÌ: Boqueria e Museu Picasso aperti. Bene.",
        "Sagrada Família e Park Güell hanno ingresso a fascia oraria OBBLIGATORIA: prenota 1–2 mesi prima.",
        "Terminal Moll Adossat: non si esce a piedi, serve il Portbus."
      ],
      ormeggio: { nome: "Moll Adossat (terminal A–E)", coord: [41.3540, 2.1720] },
      accesso: {
        modo: "navetta",
        descrizione: "Portbus fino al Monumento a Colombo (base della Rambla), 10–15 min.",
        minuti: 15,
        costoAndataRitorno: 8,      // € a persona, STIMA
        arrivoCitta: [41.3757, 2.1779],
        daVerificare: true
      },
      rischio: "medio",
      rischioNota: "Città grande: gli spostamenti interni mangiano tempo. Usa la metro, non i taxi."
    },

    /* ---------------------------------------------------------------- G5 */
    {
      id: "navigazione",
      giorno: 5,
      data: "2026-09-30",
      giornoSettimana: 3,
      citta: "Giorno di navigazione",
      paese: null,
      bandiera: "⚓",
      tipo: "mare",
      arrivo: null,
      partenza: null,
      note: "Giornata in mare. Usala per rivedere il piano di Tunisi e cambiare i soldi/contanti."
    },

    /* ---------------------------------------------------------------- G6 */
    {
      id: "tunisi",
      giorno: 6,
      data: "2026-10-01",
      giornoSettimana: 4,          // GIOVEDÌ
      citta: "Tunisi",
      portoNome: "La Goletta (La Goulette)",
      paese: "TN",
      bandiera: "🇹🇳",
      fuso: "Africa/Tunis",
      offsetOreDaBordo: -1,        // ⚠️ Tunisia UTC+1 senza ora legale, Italia UTC+2
      tipo: "scalo",
      arrivo: "08:00",
      partenza: "18:00",
      allAboardMin: 60,
      sbarcoMin: 30,               // controlli più lenti
      note: "Scalo su Tunisi centro e Medina. Il porto è La Goletta, ~12 km dal centro. " +
            "Giornata più impegnativa dell'itinerario: estero, contanti, fuso diverso.",
      avvisi: [
        "⚠️ FUSO ORARIO: a Tunisi l'ora locale è 1 ORA INDIETRO rispetto all'ora di bordo. " +
          "Il telefono si aggiorna da solo, la nave no. Ragiona SEMPRE in ora di bordo.",
        "Il dinaro tunisino non è esportabile: cambia solo il necessario, spendi tutto prima di rientrare.",
        "Fuori dagli hotel il contante è quasi obbligatorio. Porta euro da cambiare in porto.",
        "Contratta sempre il prezzo del taxi PRIMA di salire, o pretendi il tassametro.",
        "Verifica con MSC i documenti richiesti per lo sbarco."
      ],
      ormeggio: { nome: "Porto di La Goulette", coord: [36.8180, 10.3050] },
      accesso: {
        modo: "taxi",
        descrizione: "Taxi o navetta dal porto verso Tunis centre / Av. Habib Bourguiba, 25–35 min " +
                     "secondo il traffico. In alternativa treno leggero TGM da La Goulette a Tunis Marine " +
                     "(economicissimo ma lento e poco leggibile).",
        minuti: 30,
        costoAndataRitorno: 20,     // € a persona, STIMA taxi condiviso in coppia
        arrivoCitta: [36.7995, 10.1830],
        daVerificare: true
      },
      rischio: "alto",
      rischioNota: "Distanza dal porto + fuso + trasporti informali. Rientra con 90 min di margine, non 45."
    },

    /* ---------------------------------------------------------------- G7 */
    {
      id: "palermo",
      giorno: 7,
      data: "2026-10-02",
      giornoSettimana: 5,          // VENERDÌ
      citta: "Palermo",
      paese: "IT",
      bandiera: "🇮🇹",
      fuso: "Europe/Rome",
      offsetOreDaBordo: 0,
      tipo: "scalo",
      arrivo: "09:00",
      partenza: "18:00",
      allAboardMin: 60,
      sbarcoMin: 15,
      note: "Il miglior rapporto ore/valore dell'itinerario: la nave attracca a ridosso del centro " +
            "e si esce A PIEDI. Zero navette, zero costi di trasferimento, e puoi rientrare " +
            "a bordo per pranzare gratis.",
      avvisi: [
        "È VENERDÌ: gli Appartamenti Reali di Palazzo dei Normanni sono di norma visitabili " +
          "(da martedì a giovedì l'accesso è ridotto per i lavori dell'Assemblea Regionale). Giorno fortunato.",
        "Rientro a bordo per pranzo fattibile in ~20 min: vale ~€40 risparmiati sul budget."
      ],
      ormeggio: { nome: "Porto di Palermo – terminal crociere", coord: [38.1268, 13.3690] },
      accesso: {
        modo: "piedi",
        descrizione: "Si esce a piedi dal varco. Teatro Politeama ~12 min, Teatro Massimo ~18 min.",
        minuti: 12,
        costoAndataRitorno: 0,
        arrivoCitta: [38.1220, 13.3600],
        daVerificare: false
      },
      rischio: "basso",
      rischioNota: "Il giorno più rilassato. Puoi permetterti di improvvisare."
    },

    /* ---------------------------------------------------------------- G8 */
    {
      id: "napoli-sbarco",
      giorno: 8,
      data: "2026-10-03",
      giornoSettimana: 6,
      citta: "Napoli",
      paese: "IT",
      bandiera: "🇮🇹",
      fuso: "Europe/Rome",
      offsetOreDaBordo: 0,
      tipo: "sbarco",
      arrivo: "06:30",
      partenza: null,
      allAboardMin: 0,
      sbarcoMin: 0,
      note: "Sbarco. Le operazioni si distribuiscono di norma tra le 07:00 e le 09:30 secondo il gruppo. " +
            "Se non avete fretta di rientrare, mezza giornata a Napoli è regalata.",
      ormeggio: { nome: "Stazione Marittima, Molo Angioino", coord: [40.8395, 14.2588] },
      accesso: { modo: "piedi", descrizione: "Centro a piedi.", minuti: 8, costoAndataRitorno: 0, daVerificare: false },
      rischio: "basso"
    }
  ]
};

/* Categorie usate in tutte le schede — l'ordine è quello di visualizzazione */
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

/* Parametri dei tre ritmi. Sono modificabili: sono opinioni, non leggi.
   minPerTappa = quanti minuti di giornata "vale" mediamente una tappa a questo ritmo.
   Il generatore lo usa per calcolare quante tappe servono a RIEMPIRE la giornata:
   una giornata da 10 ore non può risolversi in due tappe solo perché il ritmo è lento.
   maxTappe è solo il tetto di sicurezza. */
window.RITMI = {
  lento:   { nome: "Lento",   icona: "🐢", durata: "lento", minPerTappa: 105, maxTappe: 5, pranzoMin: 90,
             bufferMin: 60, maxKmPiedi: 5,
             desc: "Poche cose fatte bene, tempi larghi, un pranzo vero seduti." },
  medio:   { nome: "Medio",   icona: "🚶", durata: "medio", minPerTappa: 72, maxTappe: 8, pranzoMin: 60,
             bufferMin: 45, maxKmPiedi: 8,
             desc: "Il ritmo di una coppia in vacanza: si vede molto senza correre." },
  veloce:  { nome: "Veloce",  icona: "⚡", durata: "veloce", minPerTappa: 48, maxTappe: 11, pranzoMin: 30,
             bufferMin: 40, maxKmPiedi: 13,
             desc: "Massima copertura, visite rapide, pranzo street food in piedi." }
};
