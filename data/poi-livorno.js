/* LIVORNO — Domenica 27/09/2026 · 09:00–19:00 · tutti a bordo 18:00
   Solo Livorno città. Prezzi in € a persona, stime aggiornate 08/2026: RIVERIFICARE. */

window.POI_livorno = [

{
  id:"lv-venezia", nome:"Quartiere Venezia Nuova", scalo:"livorno",
  cat:["quartieri","architettura","panorami"], coord:[43.5518,10.3055], top:5,
  durata:{veloce:35, medio:60, lento:100},
  prezzo:0, prezzoNote:"Gratuito. Si gira liberamente a piedi.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:1.6, gradini:20, ombra:"media"},
  quando:"qualsiasi",
  perche:"Il cuore vero di Livorno e la ragione per cui la città merita una giornata. Un dedalo di canali "+
    "scavati nel Seicento dagli stessi maestri che lavoravano a Venezia, con ponti, magazzini di mattoni "+
    "rossi affacciati sull'acqua e cantine che scendono sotto il livello del mare. È l'unico posto in "+
    "Toscana che non somiglia al resto della Toscana.",
  visita:["Ponte di Marmo e la vista sui Fossi verso la Fortezza Nuova",
          "Scali del Pontino e Scali delle Cantine, i più fotogenici",
          "Le cantine sotterranee sotto i palazzi (alcune sono locali)",
          "Chiesa di Santa Caterina, pianta ottagonale, spesso aperta la domenica"],
  tips:["È il posto migliore dove finire la giornata: la luce del tardo pomeriggio sui mattoni è la cosa più bella di Livorno.",
        "Di domenica è vivo, ci sono locali aperti sui fossi.",
        "Attenzione ai bordi dei canali: nessun parapetto in molti tratti."],
  wc:"Bar sui fossi, consumazione", verificato:"2026-08-08", daVerificare:false,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Scali_del_Ponte_di_Marmo_e_degli_isolotti_Livorno.JPG/960px-Scali_del_Ponte_di_Marmo_e_degli_isolotti_Livorno.JPG?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Venezia Nuova"}
},

{
  id:"lv-battello", nome:"Giro in battello sui Fossi Medicei", scalo:"livorno",
  cat:["esperienze","panorami","storia"], coord:[43.5480,10.3095], top:5,
  durata:{veloce:70, medio:80, lento:95},
  prezzo:14, prezzoNote:"~€12–16 a persona per il giro classico di ~70 minuti.",
  orari:{da:"10:00", a:"18:00"}, chiusoGiorni:[], slot:true,
  prenota:{url:null, anticipoGiorni:2,
    note:"Gestito da cooperative locali, biglietteria agli imbarchi (zona Piazza Cavour / Scali Finocchietti). "+
         "Nel weekend si riempie: prenota o presentati presto. Cerca 'battelli fossi Livorno' e verifica il sito attivo."},
  saltafila:null, coda:{tipica:10, punta:35},
  fatica:{km:0.3, gradini:8, ombra:"parziale"},
  quando:"mattina",
  perche:"Il modo giusto di capire Livorno: dall'acqua. Si passa sotto i ponti, dentro il fossato della "+
    "Fortezza Nuova e si costeggia la Venezia da un punto di vista che da terra non esiste. Con guida a bordo.",
  visita:["Il passaggio nel fossato della Fortezza Nuova","Le bocche delle cantine sull'acqua",
          "L'uscita verso il porto Mediceo con vista sulla Fortezza Vecchia"],
  tips:["Prendilo PRESTO nella giornata: se salta, hai ancora tempo di riorganizzare.",
        "Siediti sul lato sinistro all'andata per le foto migliori.",
        "Verifica la durata: ci sono giri da 50 min e giri lunghi da 90."],
  wc:"No a bordo", verificato:"2026-08-08", daVerificare:true
},

{
  id:"lv-terrazza", nome:"Terrazza Mascagni", scalo:"livorno",
  cat:["panorami","mare","architettura"], coord:[43.5359,10.3055], top:5,
  durata:{veloce:25, medio:40, lento:70},
  prezzo:0, prezzoNote:"Gratuita.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:0.8, gradini:0, ombra:"nessuna"},
  quando:"pomeriggio",
  perche:"Una scacchiera di 34.800 piastrelle bianche e nere sospesa sul mare, con una balaustra di colonnine "+
    "che corre per 300 metri. È l'immagine simbolo della città e funziona esattamente come promette: "+
    "ci si arriva, ci si appoggia alla ringhiera e si sta lì.",
  visita:["La prospettiva della scacchiera dall'angolo nord, verso il mare",
          "Il gazebo centrale","Le boe e l'Isola di Gorgona all'orizzonte se la giornata è limpida"],
  tips:["Zero ombra: non andarci a mezzogiorno a inizio ottobre.",
        "È a ~25 min a piedi dal centro lungo il viale Italia, oppure bus. La passeggiata è piacevole.",
        "L'Acquario è lì accanto: si abbinano naturalmente."],
  wc:"Bar della terrazza", verificato:"2026-08-08", daVerificare:false,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Livorno01.jpg/960px-Livorno01.jpg?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Terrazza Mascagni"}
},

{
  id:"lv-mercato", nome:"Mercato Centrale delle Vettovaglie", scalo:"livorno",
  cat:["cibo","architettura","shopping"], coord:[43.5497,10.3113], top:4,
  durata:{veloce:30, medio:50, lento:75},
  prezzo:0, prezzoNote:"Ingresso libero. Si spende quello che si compra.",
  orari:{da:"07:00", a:"14:00"}, chiusoGiorni:[0], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:0.5, gradini:0, ombra:"totale"},
  quando:"mattina",
  perche:"Uno dei mercati coperti più grandi d'Europa, una navata di ghisa e vetro del 1894 lunga 95 metri, "+
    "con il banco del pesce che è uno spettacolo a sé. Peccato che sia il grande escluso di questa giornata.",
  visita:["La navata centrale in prospettiva","I banchi del pesce","I banchi di torta di ceci"],
  tips:["⛔ CHIUSO LA DOMENICA — e voi sbarcate di domenica. L'app lo tiene escluso apposta.",
        "Resta in scheda perché se cambiate crociera o data è la prima cosa da rimettere in programma."],
  wc:"Sì, interno", verificato:"2026-08-08", daVerificare:false,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Mercato_delle_Vettovaglie%2C_Livorno.jpg/960px-Mercato_delle_Vettovaglie%2C_Livorno.jpg?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Mercato delle vettovaglie"}
},

{
  id:"lv-fortezza-vecchia", nome:"Fortezza Vecchia", scalo:"livorno",
  cat:["storia","architettura","panorami"], coord:[43.5535,10.3020], top:4,
  durata:{veloce:35, medio:55, lento:90},
  prezzo:5, prezzoNote:"~€5 a persona; in alcune giornate e per eventi l'accesso ai cortili è libero.",
  orari:{da:"10:00", a:"18:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:5, punta:15},
  fatica:{km:0.7, gradini:60, ombra:"parziale"},
  quando:"qualsiasi",
  perche:"La fortezza medicea che ha fatto nascere Livorno, costruita sul mare a partire da una torre "+
    "pisana dell'anno Mille e inglobando strati di undici secoli. Dai bastioni si vede tutto il porto: "+
    "la vostra nave inclusa.",
  visita:["Il Mastio di Matilde, il nucleo più antico","I camminamenti sui bastioni verso il porto",
          "La Quadratura dei Pisani, il livello archeologico più basso"],
  tips:["È la vista migliore sulla nave: buona foto ricordo.",
        "Verifica l'apertura del giorno: gli orari cambiano con gli eventi."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Livorno_-_Fortezza_Vecchia.jpg/960px-Livorno_-_Fortezza_Vecchia.jpg?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Fortezza Vecchia"}
},

{
  id:"lv-fortezza-nuova", nome:"Fortezza Nuova e i suoi fossati", scalo:"livorno",
  cat:["storia","natura","quartieri"], coord:[43.5525,10.3080], top:3,
  durata:{veloce:20, medio:35, lento:55},
  prezzo:0, prezzoNote:"Ingresso libero al parco interno.",
  orari:{da:"08:00", a:"20:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:0.6, gradini:30, ombra:"buona"},
  quando:"qualsiasi",
  perche:"Un'isola fortificata dentro la città, circondata dall'acqua su tutti i lati e trasformata in "+
    "parco pubblico. Ci si entra da un ponte, ci si siede sull'erba sopra i bastioni e si guarda la "+
    "Venezia dall'alto. Gratis, tranquillo, cinque minuti dal centro.",
  visita:["Il ponte d'ingresso da Piazza della Repubblica","Il terrapieno superiore con vista sui fossi"],
  tips:["Perfetta come pausa a metà giornata: ombra e panchine.",
        "Si abbina in 3 minuti a piedi con la Venezia Nuova."],
  wc:"No", verificato:"2026-08-08", daVerificare:false
},

{
  id:"lv-duomo", nome:"Duomo e Piazza Grande", scalo:"livorno",
  cat:["chiese","architettura"], coord:[43.5487,10.3080], top:3,
  durata:{veloce:15, medio:25, lento:40},
  prezzo:0, prezzoNote:"Gratuito.",
  orari:{da:"08:00", a:"18:30"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:0.3, gradini:8, ombra:"totale"},
  quando:"qualsiasi",
  perche:"La cattedrale di Livorno, ricostruita dopo i bombardamenti del 1943 sul disegno originale di "+
    "fine Cinquecento. Il portico a tre arcate è l'archetipo che Inigo Jones portò poi a Covent Garden "+
    "a Londra. Vale una sosta breve, non una visita lunga.",
  visita:["Il portico e il soffitto a cassettoni","Le tele seicentesche del soffitto"],
  tips:["È DOMENICA: durante le messe la visita turistica è sospesa. Passa fuori dagli orari liturgici.",
        "Sta esattamente sulla strada tra il porto e la Venezia: costa quasi zero in tempo."],
  wc:"No", verificato:"2026-08-08", daVerificare:false,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Piazza_Grande_%28Livorno%29.jpg/960px-Piazza_Grande_%28Livorno%29.jpg?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Piazza Grande (Livorno)"}
},

{
  id:"lv-acquario", nome:"Acquario di Livorno", scalo:"livorno",
  cat:["esperienze","natura"], coord:[43.5366,10.3060], top:3,
  durata:{veloce:60, medio:90, lento:120},
  prezzo:17, prezzoNote:"~€16–18 a persona. Ridotti disponibili.",
  orari:{da:"10:00", a:"18:30"}, chiusoGiorni:[], slot:false,
  prenota:{url:"https://www.acquariodilivorno.it", anticipoGiorni:1,
    note:"Biglietto online consigliato nei weekend. Verifica orari stagionali di inizio ottobre."},
  saltafila:"L'acquisto online evita la coda in biglietteria", coda:{tipica:10, punta:30},
  fatica:{km:0.6, gradini:20, ombra:"totale"},
  quando:"pomeriggio",
  perche:"Acquario di taglia media affacciato sulla Terrazza Mascagni, dedicato al Mediterraneo: vasca "+
    "dei tursiopi, tartarughe marine, meduse e un tunnel sottomarino. Non è Genova, ma è a due passi "+
    "dalla terrazza ed è al chiuso: la carta buona se il tempo gira male.",
  visita:["Il tunnel degli squali","La vasca delle tartarughe Caretta caretta","La sala delle meduse"],
  tips:["Vale se piove o se avanza tempo nel pomeriggio: 10 ore a Livorno sono tante.",
        "Si abbina obbligatoriamente alla Terrazza Mascagni, è lo stesso posto."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Livorno_Acquario_Cestoni.JPG/960px-Livorno_Acquario_Cestoni.JPG?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Acquario di Livorno"}
},

{
  id:"lv-fattori", nome:"Museo Civico Giovanni Fattori (Villa Mimbelli)", scalo:"livorno",
  cat:["arte","architettura"], coord:[43.5410,10.3110], top:3,
  durata:{veloce:45, medio:70, lento:110},
  prezzo:6, prezzoNote:"~€4–6 a persona.",
  orari:{da:"10:00", a:"13:00"}, chiusoGiorni:[1], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:5},
  fatica:{km:0.5, gradini:40, ombra:"totale"},
  quando:"mattina",
  perche:"La più importante raccolta di Macchiaioli fuori Firenze, dentro una villa ottocentesca "+
    "eclettica con parco. Fattori era livornese: qui c'è il grosso della sua produzione, insieme a "+
    "Signorini, Lega e Nomellini. Se l'arte vi interessa, è la cosa più seria della città.",
  visita:["Le marine di Fattori","La sala dedicata a Nomellini","Il salone della villa e le boiseries"],
  tips:["⚠️ Attenzione agli orari domenicali: spesso apre solo la mattina. Verifica prima di incastrarlo nel piano.",
        "Sta sulla strada tra il centro e la Terrazza Mascagni: costo di inserimento basso."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Livorno_Villa_Mimbelli.JPG/960px-Livorno_Villa_Mimbelli.JPG?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Museo civico Giovanni Fattori"}
},

{
  id:"lv-montenero", nome:"Santuario di Montenero e funicolare", scalo:"livorno",
  cat:["panorami","chiese","esperienze"], coord:[43.4855,10.3395], top:4,
  durata:{veloce:80, medio:120, lento:170},
  prezzo:4, prezzoNote:"Funicolare ~€2 a tratta a persona. Santuario gratuito. Bus urbano per arrivare alla base.",
  orari:{da:"08:00", a:"18:30"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:10, punta:25},
  fatica:{km:1.2, gradini:50, ombra:"parziale"},
  quando:"pomeriggio",
  perche:"Il santuario mariano sulla collina a sud della città, patrono della Toscana, raggiunto da una "+
    "funicolare del 1908. Ci si va per due cose: il panorama su tutto il golfo fino all'Elba, e la "+
    "Galleria degli ex voto, centinaia di tavolette dipinte da naufraghi e scampati. È commovente e strano.",
  visita:["La Galleria degli ex voto — la parte che ricorderete","Il piazzale panoramico sul golfo",
          "La corsa in funicolare, breve ma bella"],
  tips:["È dentro il comune di Livorno, ma serve ~30 min di bus per raggiungere la base della funicolare: "+
        "considera ~2 ore porta a porta. Ha senso solo se scegli il ritmo Medio o Veloce.",
        "Verifica gli orari della funicolare la domenica prima di partire dal centro."],
  wc:"Sì al santuario", verificato:"2026-08-08", daVerificare:true,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Funicolare_di_Montenero.JPG/960px-Funicolare_di_Montenero.JPG?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Funicolare di Montenero"}
},

{
  id:"lv-cacciucco", nome:"Pranzo: cacciucco alla livornese", scalo:"livorno",
  cat:["cibo","esperienze"], coord:[43.5510,10.3070], top:5,
  durata:{veloce:50, medio:80, lento:110},
  prezzo:32, prezzoNote:"~€25–40 a persona per un cacciucco vero con contorno e acqua.",
  orari:{da:"12:00", a:"15:00"}, chiusoGiorni:[], slot:false,
  prenota:{url:null, anticipoGiorni:3, note:"Domenica a pranzo le trattorie buone si riempiono: telefona qualche giorno prima."},
  saltafila:null, coda:{tipica:15, punta:40},
  fatica:{km:0.2, gradini:0, ombra:"totale"},
  quando:"pranzo",
  perche:"Il piatto che giustifica da solo lo scalo: zuppa di cinque tipi di pesce e crostacei su pane "+
    "strofinato all'aglio, cotta ore. Si mangia a Livorno e sostanzialmente da nessun'altra parte fatta "+
    "come si deve. Con 10 ore in città non avete scuse per saltarlo.",
  visita:["Chiedi se è cacciucco 'alla livornese' con cinque C","Vino: un rosso leggero, non bianco",
          "Il pane bagnato sul fondo è la parte migliore, non lasciarlo"],
  tips:["Le trattorie storiche sono nella Venezia Nuova e vicino al mercato.",
        "Richiede ~80 minuti seduti: sul ritmo Veloce l'app proporrà invece la torta di ceci."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:false
},

{
  id:"lv-cinque", nome:"Torta di ceci e '5 e 5'", scalo:"livorno",
  cat:["cibo"], coord:[43.5500,10.3100], top:4,
  durata:{veloce:15, medio:25, lento:35},
  prezzo:6, prezzoNote:"~€4–7 a persona. Street food vero.",
  orari:{da:"09:00", a:"19:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:5, punta:15},
  fatica:{km:0.1, gradini:0, ombra:"variabile"},
  quando:"qualsiasi",
  perche:"La torta di ceci in mezzo a una focaccia, con melanzane sott'olio se volete fare i seri. "+
    "Si chiama '5 e 5' perché costava cinque lire di torta e cinque di pane. È la colazione salata, "+
    "il pranzo veloce e la merenda di Livorno.",
  visita:["Chiedila 'con le melanzane'","Pepe sopra, sempre","Mangiala in piedi, è la regola"],
  tips:["È l'alternativa al cacciucco quando il ritmo è Veloce: 25 minuti contro 80.",
        "Costo quasi nullo: ottima per tenere il budget basso e spenderlo sul battello."],
  wc:"No", verificato:"2026-08-08", daVerificare:false
},

{
  id:"lv-ponce", nome:"Ponce alla livornese", scalo:"livorno",
  cat:["cibo","esperienze"], coord:[43.5502,10.3092], top:4,
  durata:{veloce:15, medio:20, lento:30},
  prezzo:4, prezzoNote:"~€3–5 a testa.",
  orari:{da:"07:00", a:"20:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:5, punta:10},
  fatica:{km:0.1, gradini:0, ombra:"totale"},
  quando:"pomeriggio",
  perche:"Caffè bollente, rum fantasia (il rum livornese, non quello caraibico), zucchero e una scorza "+
    "di limone chiamata 'la vela'. Si beve nel bicchierino di vetro spesso, in piedi al bancone. È un "+
    "rito cittadino, non una bevanda.",
  visita:["Chiedi il 'ponce corretto'","La vela di limone va lasciata dentro","Si beve caldo e veloce"],
  tips:["Costa 4 euro e dura 15 minuti: l'app lo userà per riempire i buchi piccoli del programma.",
        "Il bar storico è vicino alla Venezia. Non è un posto turistico: aspettati un bancone e basta."],
  wc:"Del bar", verificato:"2026-08-08", daVerificare:false,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Gottino_di_ponce_alla_livornese_con_vela.jpg/960px-Gottino_di_ponce_alla_livornese_con_vela.jpg?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Ponce livornese"}
},

{
  id:"lv-repubblica", nome:"Piazza della Repubblica", scalo:"livorno",
  cat:["architettura","quartieri"], coord:[43.5527,10.3105], top:2,
  durata:{veloce:10, medio:15, lento:25},
  prezzo:0, prezzoNote:"Gratuita.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:0.3, gradini:0, ombra:"nessuna"},
  quando:"qualsiasi",
  perche:"Non è una piazza: è un ponte. Uno dei più larghi d'Europa, costruito coprendo il fosso reale, "+
    "220 metri di lastricato sotto cui scorre ancora l'acqua. Ci si passa sopra senza accorgersene, "+
    "ed è esattamente questo il trucco.",
  visita:["Affacciati dai lati per vedere l'acqua che scorre sotto","Le due statue dei granduchi Lorena"],
  tips:["Costo di inserimento praticamente zero: sta tra il centro e la Fortezza Nuova.",
        "Buon punto di orientamento se vi perdete."],
  wc:"No", verificato:"2026-08-08", daVerificare:false
},

{
  id:"lv-lungomare", nome:"Passeggiata sul Viale Italia e la Scogliera", scalo:"livorno",
  cat:["mare","panorami","natura"], coord:[43.5300,10.3020], top:3,
  durata:{veloce:30, medio:50, lento:90},
  prezzo:0, prezzoNote:"Gratuita.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:2.5, gradini:0, ombra:"scarsa"},
  quando:"pomeriggio",
  perche:"Il lungomare che scende dalla Terrazza Mascagni verso sud, tra stabilimenti liberty, scogliere "+
    "e piscine sul mare. A inizio ottobre l'acqua è ancora buona e i livornesi ci fanno il bagno. "+
    "È il modo giusto di chiudere una giornata lenta.",
  visita:["Gli stabilimenti storici tra Terrazza e Antignano","Le scogliere basse dove ci si siede",
          "Il tramonto verso la Gorgona e la Capraia"],
  tips:["Zero ombra: cappello e acqua.","Perfetta con ritmo Lento. Con ritmo Veloce l'app la scarterà."],
  wc:"Bar sul viale", verificato:"2026-08-08", daVerificare:false
}

];
