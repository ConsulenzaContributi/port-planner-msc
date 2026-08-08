/* TUNISI — Giovedì 01/10/2026 · 08:00–18:00 ORA DI BORDO · tutti a bordo 17:00 ora di bordo
   ⚠️ A TERRA L'OROLOGIO SEGNA UN'ORA IN MENO. Ragiona sempre in ora di bordo.
   Scope scelto: Tunisi centro e Medina. Cartagine e Sidi Bou Said sono inclusi come OPZIONALI
   (campo fuoriScope: true) perché stanno sulla linea di rientro: attivali solo se vuoi.
   Prezzi indicati in € equivalenti a persona. La moneta è il dinaro tunisino (TND), NON esportabile. */

window.POI_tunisi = [

{
  id:"tn-medina", nome:"Medina di Tunisi (UNESCO)", scalo:"tunisi",
  cat:["iconico","quartieri","storia","shopping"], coord:[36.7980,10.1710], top:5,
  durata:{veloce:60, medio:105, lento:160},
  prezzo:0, prezzoNote:"Ingresso libero. Si spende solo quello che si compra (contrattando).",
  orari:{da:"08:00", a:"18:00"}, chiusoGiorni:[5], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:2.5, gradini:40, ombra:"buona nei souk coperti"},
  quando:"mattina",
  perche:"Settecento monumenti in un labirinto di vicoli coperti fondato nel VII secolo: souk delle "+
    "spezie, dei profumi, degli orafi, dei berretti rossi. Ogni mestiere ha ancora la sua strada. "+
    "È il motivo per cui siete scesi, ed è denso, rumoroso, bellissimo e faticoso.",
  visita:["Souk El Attarine, i profumieri — il più bello","Souk des Chéchias, dove si fanno ancora i berretti a mano",
          "Le porte di legno dipinte di blu con le borchie disegnate","Bab El Bhar (Porte de France), la soglia tra medina e città coloniale"],
  tips:["🧭 ENTRA DA BAB EL BHAR e tieni quella come porta di riferimento: la medina disorienta in fretta.",
        "Aspettati insistenza commerciale continua. Un 'no, grazie' sorridente e continuare a camminare funziona.",
        "Se qualcuno si offre di 'accompagnarvi gratis' a una terrazza panoramica, finisce in un negozio di tappeti.",
        "Contratta partendo da un terzo del prezzo chiesto. È previsto dal gioco, non è maleducazione.",
        "⚠️ Il venerdì a mezzogiorno molte botteghe chiudono per la preghiera — voi però siete di giovedì."],
  wc:"Nei caffè, con consumazione", verificato:"2026-08-08", daVerificare:true
},

{
  id:"tn-zitouna", nome:"Moschea Zitouna (Grande Moschea)", scalo:"tunisi",
  cat:["chiese","storia","architettura"], coord:[36.7975,10.1710], top:4,
  durata:{veloce:25, medio:40, lento:55},
  prezzo:4, prezzoNote:"~10 TND a persona (~€3–4) per l'accesso al cortile e alla terrazza.",
  orari:{da:"08:00", a:"14:00"}, chiusoGiorni:[5], slot:false,
  prenota:null, saltafila:null, coda:{tipica:5, punta:15},
  fatica:{km:0.3, gradini:40, ombra:"parziale"},
  quando:"mattina",
  perche:"Il cuore della medina e la moschea più antica della città, fondata nell'VIII secolo. Ai non "+
    "musulmani è consentito il cortile porticato e la terrazza: da lì si vedono i tetti bianchi della "+
    "medina e i minareti. Le colonne del portico vengono da Cartagine, riciclate.",
  visita:["Il cortile con il quadrante solare","Il minareto a base quadrata",
          "Le colonne romane di spoglio da Cartagine","La terrazza sui tetti bianchi"],
  tips:["Abbigliamento coperto: spalle e ginocchia coperte per entrambi. Foulard per la testa consigliato.",
        "Chiude a metà giornata: mettila nella prima parte del programma.",
        "Le terrazze dei negozi di tappeti attorno offrono la stessa vista 'gratis' — ma poi vi vendono un tappeto."],
  wc:"No", verificato:"2026-08-08", daVerificare:true
},

{
  id:"tn-bourguiba", nome:"Avenue Habib Bourguiba e la città coloniale", scalo:"tunisi",
  cat:["architettura","quartieri"], coord:[36.7995,10.1830], top:4,
  durata:{veloce:30, medio:50, lento:80},
  prezzo:0, prezzoNote:"Gratuito.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:1.5, gradini:0, ombra:"buona, viale alberato"},
  quando:"qualsiasi",
  perche:"I francesi hanno costruito accanto alla medina una città parallela con boulevard, caffè "+
    "all'aperto, teatri art nouveau e una cattedrale cattolica di fronte all'ambasciata. Camminare "+
    "dall'una all'altra in cinque minuti è l'esperienza che racconta la Tunisia meglio di qualsiasi museo.",
  visita:["La Cattedrale di San Vincenzo de' Paoli, di fronte all'ambasciata di Francia",
          "Il Théâtre Municipal, art nouveau bianco e sinuoso","La Torre dell'Orologio all'estremità est",
          "I caffè sotto i ficus del viale centrale"],
  tips:["È dove vi lascia il taxi: punto di partenza e di rientro della giornata.",
        "Presenza di polizia e militari attorno agli edifici istituzionali: normale, non fotografarli.",
        "Il caffè sotto i portici è il posto giusto per la pausa a metà giornata."],
  wc:"Nei caffè", verificato:"2026-08-08", daVerificare:false
},

{
  id:"tn-bardo", nome:"Museo Nazionale del Bardo", scalo:"tunisi",
  cat:["arte","storia","iconico"], coord:[36.8093,10.1345], top:5,
  durata:{veloce:75, medio:110, lento:160},
  prezzo:5, prezzoNote:"~13–15 TND a persona (~€4–5). Supplemento per fotografare.",
  orari:{da:"09:30", a:"16:30"}, chiusoGiorni:[1], slot:false,
  prenota:{url:"http://www.bardomuseum.tn", anticipoGiorni:0,
    note:"⚠️ VERIFICA L'APERTURA prima di partire: il museo ha avuto lunghi periodi di chiusura negli anni scorsi. "+
         "Controlla anche con l'ufficio escursioni di bordo."},
  saltafila:null, coda:{tipica:10, punta:25},
  fatica:{km:1.5, gradini:60, ombra:"totale, climatizzato"},
  quando:"mattina",
  perche:"La più grande collezione di mosaici romani del mondo, dentro un palazzo beylicale del XIX "+
    "secolo. Non sono frammenti: sono pavimenti interi di ville, larghi come stanze, con scene di caccia, "+
    "Virgilio tra le muse, Nettuno che emerge dal mare. Se una sola cosa vi resta della Tunisia, è questa.",
  visita:["Il mosaico di Virgilio tra le Muse — l'unico ritratto antico del poeta",
          "Il Trionfo di Nettuno, un pavimento intero","La sala di Cartagine e i corredi punici",
          "I soffitti dipinti del palazzo beylicale, spesso ignorati dai visitatori"],
  tips:["È fuori dalla medina, verso ovest: ~20 min di taxi dal centro. Metti in conto il trasferimento.",
        "Climatizzato: è la carta giusta per le ore centrali e calde.",
        "💶 Costa pochissimo. Con €100 di budget e trasporti a €40, questo è quasi gratis."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true
},

{
  id:"tn-mercato", nome:"Marché Central de Tunis", scalo:"tunisi",
  cat:["cibo","quartieri","shopping"], coord:[36.7985,10.1770], top:3,
  durata:{veloce:25, medio:40, lento:60},
  prezzo:0, prezzoNote:"Ingresso libero.",
  orari:{da:"06:00", a:"14:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:0.6, gradini:0, ombra:"totale"},
  quando:"mattina",
  perche:"Il mercato coperto dei tunisini, non dei turisti: banchi di pesce del Mediterraneo, montagne "+
    "di harissa, datteri deglet nour, olive, spezie. Nessuno cerca di vendervi un tappeto. È il "+
    "contrappeso onesto ai souk della medina.",
  visita:["Il padiglione del pesce","I banchi di harissa fresca e di datteri",
          "Le spezie sfuse, molto più economiche che nei souk"],
  tips:["Chiude a metà giornata: solo mattina.",
        "Sta tra Bourguiba e la medina: costo di inserimento quasi nullo.",
        "Datteri e harissa sono i souvenir commestibili giusti — verifica solo le regole doganali per rientrare."],
  wc:"No", verificato:"2026-08-08", daVerificare:true
},

{
  id:"tn-dar", nome:"Dar Ben Abdallah — Museo delle Arti e Tradizioni", scalo:"tunisi",
  cat:["arte","storia","architettura"], coord:[36.7935,10.1670], top:3,
  durata:{veloce:35, medio:55, lento:80},
  prezzo:3, prezzoNote:"~5–8 TND a persona (~€2–3).",
  orari:{da:"09:30", a:"16:30"}, chiusoGiorni:[1], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:5},
  fatica:{km:0.8, gradini:30, ombra:"totale"},
  quando:"qualsiasi",
  perche:"Un palazzo aristocratico del Settecento nella medina bassa, con cortile in marmo, fontane e "+
    "stanze allestite con manichini in costume che raccontano la vita domestica tunisina. Il vero motivo "+
    "per entrare è vedere com'è fatta dentro una casa della medina: dall'esterno non si capisce nulla.",
  visita:["Il cortile centrale in marmo con la fontana","I soffitti in legno dipinto",
          "Le stanze da sposa e i costumi ricamati d'oro"],
  tips:["Costa due euro ed è tranquillo: buona pausa dal caos dei souk.",
        "Sta nella parte sud della medina, meno battuta e più autentica."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true
},

{
  id:"tn-tè", nome:"Tè alla menta con i pinoli in un caffè storico", scalo:"tunisi",
  cat:["cibo","esperienze"], coord:[36.7970,10.1700], top:4,
  durata:{veloce:20, medio:35, lento:50},
  prezzo:3, prezzoNote:"~3–6 TND a testa (~€1–2). Ridicolmente economico.",
  orari:{da:"08:00", a:"20:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:5, punta:10},
  fatica:{km:0.1, gradini:20, ombra:"totale"},
  quando:"pomeriggio",
  perche:"Il tè verde alla menta con una manciata di pinoli tostati dentro il bicchiere, bevuto seduti "+
    "su stuoie in un caffè della medina con i muri di piastrelle. È la pausa che rende umana una giornata "+
    "a 30 gradi dentro un labirinto.",
  visita:["Chiedi 'thé aux pignons'","I pinoli si mangiano alla fine, col cucchiaino",
          "Siediti dentro, non ai tavolini esterni per turisti"],
  tips:["I caffè storici della medina hanno terrazze con vista sui tetti: chiedi se c'è.",
        "Costa due euro e riempie un buco da 30 minuti: l'app lo userà spesso."],
  wc:"Del locale", verificato:"2026-08-08", daVerificare:false
},

{
  id:"tn-pranzo", nome:"Pranzo tunisino: brik, couscous, mechouia", scalo:"tunisi",
  cat:["cibo","esperienze"], coord:[36.7960,10.1700], top:4,
  durata:{veloce:45, medio:75, lento:105},
  prezzo:15, prezzoNote:"~€10–25 a persona. Nei ristoranti storici della medina si spende poco per molto.",
  orari:{da:"12:00", a:"15:00"}, chiusoGiorni:[], slot:false,
  prenota:{url:null, anticipoGiorni:2, note:"I ristoranti storici dentro la medina si riempiono a mezzogiorno. Chiedi al concierge di bordo di telefonare."},
  saltafila:null, coda:{tipica:15, punta:30},
  fatica:{km:0.3, gradini:20, ombra:"totale"},
  quando:"pranzo",
  perche:"Brik all'uovo (un fagottino fritto con l'uovo ancora liquido dentro, si mangia con le mani "+
    "e si rischia sempre di macchiarsi), salade mechouia di peperoni arrostiti, couscous di agnello. "+
    "Nei palazzi ristrutturati della medina si pranza in cortili di marmo per venti euro.",
  visita:["Il brik va morso con attenzione: l'uovo cola","La harissa è seria, assaggiala prima di abbondare",
          "Chiedi l'acqua in bottiglia sigillata"],
  tips:["⚠️ Acqua sempre in bottiglia sigillata, niente ghiaccio, niente verdura cruda lavata. Regola standard.",
        "💶 Pranzo, tè e museo del Bardo insieme costano meno del solo trasporto: qui il budget non è il problema."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:false
},

{
  id:"tn-cambio", nome:"Cambio valuta e gestione contanti", scalo:"tunisi",
  cat:["esperienze"], coord:[36.8180,10.3050], top:3,
  durata:{veloce:15, medio:20, lento:25},
  prezzo:0, prezzoNote:"Nessun costo diretto, ma serve pianificarlo.",
  orari:{da:"08:00", a:"18:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:10, punta:25},
  fatica:{km:0.1, gradini:0, ombra:"totale"},
  quando:"mattina",
  perche:"Non è un'attrazione, è un passaggio obbligato che l'app tratta come una tappa perché occupa "+
    "tempo reale. Il dinaro non si compra fuori dalla Tunisia e non si può portare via: si cambia allo "+
    "sbarco e si spende tutto prima di risalire.",
  visita:["Cambia in porto o in banca, con ricevuta","Cambia poco: 100–150 TND in due bastano ampiamente",
          "Conserva la ricevuta: serve se vuoi ricambiare gli avanzi all'uscita"],
  tips:["⚠️ Le carte funzionano solo negli hotel e nei ristoranti grandi. Nei souk e nei taxi: contante.",
        "Tieni banconote piccole: nessuno ha mai il resto.",
        "Spendi gli ultimi dinari in datteri o harissa al porto prima di reimbarcarti."],
  wc:"Al terminal", verificato:"2026-08-08", daVerificare:true
},

/* --------- OPZIONALI: fuori dallo scope 'Tunisi centro', ma sulla linea di rientro --------- */

{
  id:"tn-sidibou", nome:"Sidi Bou Saïd", scalo:"tunisi", fuoriScope:true,
  cat:["iconico","quartieri","panorami"], coord:[36.8707,10.3472], top:5,
  durata:{veloce:60, medio:90, lento:130},
  prezzo:2, prezzoNote:"Ingresso libero al borgo. Treno TGM ~1 TND. Café des Nattes ~5 TND.",
  orari:{da:"08:00", a:"19:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:1.8, gradini:150, ombra:"scarsa"},
  quando:"pomeriggio",
  perche:"Il borgo bianco e blu a picco sul golfo, con le porte borchiate, le bouganville e i caffè "+
    "sulla terrazza. Klee e Macke ci vennero nel 1914 e ne uscirono pittori diversi. È la cartolina "+
    "della Tunisia, ed è meritata.",
  visita:["Il Café des Nattes in cima alla scalinata","La terrazza panoramica sul porticciolo",
          "Dar el-Annabi, casa tradizionale visitabile","Le porte blu con le borchie a motivi diversi casa per casa"],
  tips:["📍 FUORI dallo scope che hai scelto (Tunisi centro), ma sta sulla LINEA TGM del rientro verso "+
        "La Goletta: aggiungerlo costa meno di quanto sembri.",
        "Attivalo dai filtri se vuoi valutarlo. Con ritmo Veloce ci sta.",
        "Salita ripida e scalinata: non è comodo con il caldo del primo pomeriggio."],
  wc:"Nei caffè", verificato:"2026-08-08", daVerificare:true
},

{
  id:"tn-cartagine", nome:"Cartagine — siti archeologici", scalo:"tunisi", fuoriScope:true,
  cat:["storia","iconico","panorami"], coord:[36.8528,10.3230], top:5,
  durata:{veloce:80, medio:130, lento:190},
  prezzo:5, prezzoNote:"~12–15 TND a persona per il biglietto cumulativo che vale su più recinti.",
  orari:{da:"08:00", a:"17:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:5, punta:15},
  fatica:{km:3.0, gradini:100, ombra:"NESSUNA"},
  quando:"mattina",
  perche:"Quello che resta della città che sfidò Roma per tre guerre e perse: le Terme di Antonino "+
    "sul mare, il porto punico a ferro di cavallo, il Tofet, la collina di Byrsa. I siti sono sparsi "+
    "su alcuni chilometri e il biglietto è cumulativo: bisogna scegliere quali fare.",
  visita:["Terme di Antonino — il più scenografico, colonne enormi sul mare",
          "I porti punici, ancora riconoscibili dalla forma","La collina di Byrsa e il panorama sul golfo"],
  tips:["📍 FUORI dallo scope scelto. Sta sulla linea TGM di rientro, ma i recinti sono distanti tra loro "+
        "e servono taxi tra l'uno e l'altro: metti in conto ~2h30 reali, non 1h.",
        "⚠️ Zero ombra. A inizio ottobre a mezzogiorno è durissima.",
        "Se lo attivi, taglia la medina o il Bardo: non ci stanno tutti e tre."],
  wc:"Ai principali recinti", verificato:"2026-08-08", daVerificare:true
}

];
