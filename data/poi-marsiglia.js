/* MARSIGLIA — Lunedì 28/09/2026 · 10:00–19:00 · tutti a bordo 18:00
   Solo Marsiglia città. Giornata reale in centro: ~7h. Prezzi in € a persona: RIVERIFICARE. */

window.POI_marsiglia = [

{
  id:"ms-vieuxport", nome:"Vieux-Port e l'Ombrière di Norman Foster", scalo:"marsiglia",
  cat:["architettura","quartieri","panorami"], coord:[43.2951,5.3745], top:5,
  durata:{veloce:25, medio:45, lento:75},
  prezzo:0, prezzoNote:"Gratuito.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:1.2, gradini:0, ombra:"scarsa"},
  quando:"qualsiasi",
  perche:"Il porto vecchio è il salotto e il punto di partenza di tutto: 26 secoli che i Focesi hanno "+
    "iniziato qui. All'estremità c'è l'Ombrière, una lastra di acciaio specchiante sospesa a 6 metri "+
    "firmata Norman Foster, sotto cui tutti si fotografano riflessi a testa in giù.",
  visita:["Il riflesso sotto l'Ombrière","Il mercato del pesce sulla banchina (mattina presto)",
          "Il ferry-boat che attraversa il porto per pochi centesimi","Le due fortezze all'imbocco"],
  tips:["È dove vi lascia la navetta: è il punto zero della giornata.",
        "Il mercato del pesce finisce presto: arrivando alle 10:30 lo trovate agli sgoccioli.",
        "Il ferry-boat traghetto vale la corsa: 3 minuti, costa pochissimo, ed è un'istituzione."],
  wc:"Pubblici sulla banchina", verificato:"2026-08-08", daVerificare:false,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Vieux-Port_Mairie_R01.jpg/960px-Vieux-Port_Mairie_R01.jpg?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Vieux-Port (it.wikipedia.org)"}
},

{
  id:"ms-panier", nome:"Le Panier, il quartiere più antico", scalo:"marsiglia",
  cat:["quartieri","architettura","shopping"], coord:[43.2985,5.3665], top:5,
  durata:{veloce:40, medio:70, lento:110},
  prezzo:0, prezzoNote:"Gratuito. Botteghe artigiane con prezzi vari.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:1.8, gradini:120, ombra:"buona"},
  quando:"mattina",
  perche:"Il quartiere sulla collina dove Marsiglia è nata: vicoli stretti, scale, panni stesi, murales "+
    "enormi e botteghe di ceramisti e saponai. Ha smesso di essere malfamato ed è diventato bellissimo "+
    "senza diventare finto. Si gira senza meta, ed è quello il punto.",
  visita:["La Vieille Charité, ospizio barocco con cappella ovale — il capolavoro nascosto",
          "Place des Moulins, la piazza più tranquilla della città",
          "I murales lungo Rue du Panier","Le botteghe di savon de Marseille artigianale"],
  tips:["Salita continua e scale: metti scarpe serie.",
        "⚠️ I musei dentro la Vieille Charité chiudono di norma il lunedì — il cortile e la cappella "+
        "restano spesso visitabili. Verifica.",
        "Si incastra perfettamente tra Vieux-Port e la Major: zero tempo perso."],
  wc:"Bar della zona", verificato:"2026-08-08", daVerificare:true,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Street_in_Marseille_-_Panier.jpg/960px-Street_in_Marseille_-_Panier.jpg?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Le Panier"}
},

{
  id:"ms-mucem", nome:"MuCEM e Fort Saint-Jean", scalo:"marsiglia",
  cat:["arte","architettura","panorami"], coord:[43.2966,5.3608], top:5,
  durata:{veloce:60, medio:110, lento:160},
  prezzo:11, prezzoNote:"~€11 a persona per le esposizioni. Il Fort Saint-Jean, le passerelle e le "+
    "terrazze panoramiche sono GRATUITI.",
  orari:{da:"10:00", a:"19:00"}, chiusoGiorni:[2], slot:false,
  prenota:{url:"https://www.mucem.org", anticipoGiorni:1,
    note:"Biglietto online consigliato. Verifica quali mostre temporanee sono in corso a fine settembre 2026."},
  saltafila:"Il biglietto online salta la cassa", coda:{tipica:10, punta:30},
  fatica:{km:1.5, gradini:60, ombra:"scarsa sulle passerelle"},
  quando:"pomeriggio",
  perche:"Il museo delle civiltà del Mediterraneo, un cubo nero avvolto in un reticolo di cemento "+
    "fibrorinforzato che filtra la luce come un moucharabieh. Vale l'architettura di Rudy Ricciotti "+
    "anche senza entrare: due passerelle sospese lo collegano al Fort Saint-Jean e alla città vecchia, "+
    "e si percorrono gratis con il mare sotto.",
  visita:["La passerella sospesa verso il Fort Saint-Jean — la foto migliore di Marsiglia",
          "La rampa esterna a spirale attorno al cubo","I giardini del forte e la vista sulla Major",
          "Il tetto-terrazza del MuCEM"],
  tips:["✅ È aperto il lunedì (chiude il martedì): siete fortunati.",
        "Se il budget stringe, fate solo passerelle e forte: gratis e sono il 70% dell'esperienza.",
        "Si abbina alla Cathédrale de la Major, che è a 5 minuti a piedi."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true
},

{
  id:"ms-major", nome:"Cathédrale de la Major", scalo:"marsiglia",
  cat:["chiese","architettura"], coord:[43.2990,5.3648], top:4,
  durata:{veloce:20, medio:35, lento:50},
  prezzo:0, prezzoNote:"Gratuita.",
  orari:{da:"10:00", a:"18:00"}, chiusoGiorni:[1], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:5},
  fatica:{km:0.4, gradini:30, ombra:"totale dentro"},
  quando:"qualsiasi",
  perche:"Una cattedrale bizantino-romanica a strisce bianche e verdi, grande quanto una basilica romana, "+
    "piantata tra il porto commerciale e la città vecchia. L'interno è un'esplosione di marmi policromi "+
    "e mosaici che non ti aspetti dall'esterno.",
  visita:["Le cupole a strisce viste dal sagrato","I mosaici del coro","La vista sul porto dal piazzale"],
  tips:["⚠️ Molte cattedrali francesi chiudono il lunedì: VERIFICA questa prima di metterla in programma.",
        "Sotto il sagrato ci sono le Voûtes de la Major, gallerie con negozi e caffè: pausa comoda."],
  wc:"Nelle Voûtes sotto", verificato:"2026-08-08", daVerificare:true
},

{
  id:"ms-notredame", nome:"Notre-Dame de la Garde", scalo:"marsiglia",
  cat:["iconico","panorami","chiese"], coord:[43.2840,5.3712], top:5,
  durata:{veloce:60, medio:90, lento:120},
  prezzo:0, prezzoNote:"Ingresso GRATUITO. Costo eventuale: bus di linea o petit train per la salita.",
  orari:{da:"07:00", a:"18:15"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:5, punta:20},
  fatica:{km:1.0, gradini:120, ombra:"nessuna"},
  quando:"qualsiasi",
  perche:"La Bonne Mère: la basilica sul punto più alto della città, con la Madonna dorata di 11 metri "+
    "sul campanile che si vede da tutta Marsiglia e da tutto il mare. Dentro è tappezzata di ex voto di "+
    "marinai — modellini di navi appesi al soffitto. Dalla terrazza si vede tutto: città, isole, calanchi.",
  visita:["La terrazza panoramica a 360°","Gli ex voto navali appesi nella navata",
          "I mosaici dorati dell'abside","Le cicatrici dei proiettili del 1944 sulle mura esterne"],
  tips:["Salita ripida: il bus 60 dal Vieux-Port ci arriva in ~15 min ed è la scelta giusta con questo caldo.",
        "Ingresso gratuito: è il punto più alto e più bello della giornata a costo zero.",
        "Metti in conto ~90 minuti totali andata-ritorno dal Vieux-Port. Con ritmo Veloce sacrifica altro."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:false,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Notre-Dame_de_la_Garde_aerial_view_2020.jpeg/960px-Notre-Dame_de_la_Garde_aerial_view_2020.jpeg?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Notre-Dame-de-la-Garde"}
},

{
  id:"ms-stvictor", nome:"Abbaye Saint-Victor e la cripta", scalo:"marsiglia",
  cat:["chiese","storia"], coord:[43.2905,5.3648], top:3,
  durata:{veloce:25, medio:40, lento:60},
  prezzo:2, prezzoNote:"Chiesa gratuita, cripta ~€2 a persona.",
  orari:{da:"09:00", a:"19:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:5},
  fatica:{km:0.6, gradini:50, ombra:"totale"},
  quando:"qualsiasi",
  perche:"Un'abbazia fortificata del V secolo che sembra un castello, costruita su una necropoli "+
    "paleocristiana. La cripta è la parte da vedere: sarcofagi romani, cappelle scavate nella roccia e "+
    "una Vergine Nera. È il posto più antico e più silenzioso di Marsiglia.",
  visita:["La cripta e i sarcofagi del IV secolo","La Vergine Nera","Le torri merlate dall'esterno"],
  tips:["Sta sulla salita verso Notre-Dame de la Garde: costo di inserimento bassissimo se andate lassù.",
        "Il forno accanto vende le navettes, i biscotti a forma di barca di Marsiglia."],
  wc:"No", verificato:"2026-08-08", daVerificare:true
},

{
  id:"ms-vallon", nome:"Vallon des Auffes", scalo:"marsiglia",
  cat:["quartieri","panorami","mare"], coord:[43.2846,5.3527], top:4,
  durata:{veloce:30, medio:45, lento:75},
  prezzo:0, prezzoNote:"Gratuito.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:1.0, gradini:60, ombra:"scarsa"},
  quando:"pomeriggio",
  perche:"Un porticciolo di pescatori grande come un fazzoletto, incastrato sotto un viadotto stradale, "+
    "con le barche colorate e le casette basse a ridosso dell'acqua. Sembra un villaggio di provincia "+
    "dimenticato dentro una metropoli, e sta a 20 minuti dal Vieux-Port lungo la Corniche.",
  visita:["La vista dall'alto dal ponte della Corniche — la cartolina","La discesa tra le barche",
          "I ristoranti di bouillabaisse storici (cari)"],
  tips:["Ci si arriva col bus 83 lungo la Corniche: la corsa stessa è panoramica e vale il biglietto.",
        "È fuori dal circuito principale: ha senso con ritmo Medio o Lento, non Veloce."],
  wc:"Bar", verificato:"2026-08-08", daVerificare:false
},

{
  id:"ms-noailles", nome:"Marché des Capucins e quartiere Noailles", scalo:"marsiglia",
  cat:["cibo","quartieri","shopping"], coord:[43.2955,5.3790], top:4,
  durata:{veloce:30, medio:50, lento:75},
  prezzo:0, prezzoNote:"Ingresso libero. Spezie e frutta a prezzi bassissimi.",
  orari:{da:"08:00", a:"19:00"}, chiusoGiorni:[0], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:0.8, gradini:0, ombra:"parziale"},
  quando:"mattina",
  perche:"Il mercato che chiamano 'la pancia di Marsiglia': banchi di spezie nordafricane, montagne di "+
    "frutta, pesce, olive, menta a mazzi. È rumoroso, denso, per niente turistico ed è dove si capisce "+
    "che Marsiglia guarda a sud più che a Parigi.",
  visita:["I banchi di spezie sfuse","Le pasticcerie tunisine e algerine della via",
          "Il pane e le focacce nordafricane appena sfornate"],
  tips:["✅ Aperto il lunedì (chiude la domenica). Fortunati di nuovo.",
        "Tienilo stretto se avete poco tempo: 30 minuti bastano per l'effetto.",
        "Zona affollata: attenzione a portafogli e telefono, come in ogni mercato."],
  wc:"No", verificato:"2026-08-08", daVerificare:true,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Marseille_-_M%C3%A9tro_%26_Tramway_-_Noailles_%287537853682%29.jpg/960px-Marseille_-_M%C3%A9tro_%26_Tramway_-_Noailles_%287537853682%29.jpg?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Noailles (Marsiglia)"}
},

{
  id:"ms-coursjulien", nome:"Cours Julien e la street art", scalo:"marsiglia",
  cat:["quartieri","arte","shopping"], coord:[43.2930,5.3840], top:3,
  durata:{veloce:30, medio:50, lento:80},
  prezzo:0, prezzoNote:"Gratuito.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:1.2, gradini:60, ombra:"buona"},
  quando:"pomeriggio",
  perche:"Il quartiere bohémien sopra Noailles: ogni muro, saracinesca e scalinata è dipinto, e cambia "+
    "di continuo. Caffè con i tavolini fuori, negozi di dischi, botteghe di designer. È la Marsiglia "+
    "giovane, l'opposto della cartolina.",
  visita:["Le scale dipinte del Cours Julien","Rue Bussy l'Indien e i murales grandi",
          "La piazza alberata con i caffè"],
  tips:["Si abbina a Noailles: sono contigui, 5 minuti di salita.",
        "Buon posto per un caffè seduti a metà pomeriggio, prima di rientrare."],
  wc:"Bar", verificato:"2026-08-08", daVerificare:false,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Marseille_Metro_ND_du_Mont.jpg/960px-Marseille_Metro_ND_du_Mont.jpg?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Notre-Dame-du-Mont - Cours Julien (it.wikipedia.org)"}
},

{
  id:"ms-longchamp", nome:"Palais Longchamp e il suo parco", scalo:"marsiglia",
  cat:["architettura","natura","panorami"], coord:[43.3049,5.3948], top:3,
  durata:{veloce:30, medio:50, lento:80},
  prezzo:0, prezzoNote:"Parco e colonnato gratuiti. I musei interni sono a pagamento ma il lunedì chiudono.",
  orari:{da:"07:00", a:"20:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:1.0, gradini:80, ombra:"buona"},
  quando:"qualsiasi",
  perche:"Un monumento all'acqua: una cascata monumentale del 1869 costruita per celebrare l'arrivo "+
    "dell'acquedotto della Durance, con colonnati, tori di bronzo e giochi d'acqua che scendono in un "+
    "parco. È grandioso in modo un po' assurdo, ed è gratis.",
  visita:["La cascata centrale e il gruppo scultoreo dei tori","Il colonnato semicircolare",
          "Il parco alle spalle, ombreggiato"],
  tips:["⚠️ I musei dentro (Belle Arti, Storia Naturale) chiudono il LUNEDÌ: mettete in conto solo l'esterno.",
        "È fuori dal centro (metro Cinq Avenues): ~20 min dal Vieux-Port. Solo se avanza tempo."],
  wc:"Nel parco", verificato:"2026-08-08", daVerificare:true
},

{
  id:"ms-if", nome:"Château d'If", scalo:"marsiglia",
  cat:["storia","esperienze","panorami"], coord:[43.2797,5.3253], top:4,
  durata:{veloce:150, medio:180, lento:210},
  prezzo:18, prezzoNote:"~€6 ingresso + ~€12 traghetto andata/ritorno a persona.",
  orari:{da:"09:30", a:"17:00"}, chiusoGiorni:[1], slot:true,
  prenota:{url:"https://www.chateau-if.fr", anticipoGiorni:5,
    note:"Traghetto dal Vieux-Port. VERIFICA l'apertura del lunedì a fine settembre: in bassa stagione "+
         "il castello chiude spesso di lunedì. Se chiude, l'app lo esclude da sola."},
  saltafila:null, coda:{tipica:20, punta:45},
  fatica:{km:1.0, gradini:100, ombra:"nessuna"},
  quando:"mattina",
  perche:"L'isola-prigione del Conte di Montecristo, che esiste davvero: fortezza cinquecentesca a 20 "+
    "minuti di barca, celle scavate nella roccia, e dalla terrazza la vista più bella su Marsiglia "+
    "vista dal mare. Dumas ci ha fatto scavare un tunnel a Edmond Dantès che i visitatori cercano ancora.",
  visita:["La 'cella di Edmond Dantès' con il buco nel muro, inventata ma deliziosa",
          "La terrazza superiore con Marsiglia e Notre-Dame all'orizzonte","Le celle dei prigionieri poveri contro quelle dei ricchi"],
  tips:["⛔ Attenzione: costa 3 ORE della vostra giornata da 7. È una scelta escludente: o l'If o la città.",
        "Con arrivo alle 10:00 e rientro alle 18:00 è fattibile ma vi mangia tutto il resto.",
        "Se il mare è mosso i traghetti saltano: non costruirci sopra la giornata."],
  wc:"Sì sull'isola", verificato:"2026-08-08", daVerificare:true
},

{
  id:"ms-savon", nome:"Bottega storica del Savon de Marseille", scalo:"marsiglia",
  cat:["shopping","esperienze"], coord:[43.2955,5.3720], top:3,
  durata:{veloce:15, medio:25, lento:40},
  prezzo:12, prezzoNote:"Gratis entrare. Un cubo da 300g di sapone vero costa ~€5–8.",
  orari:{da:"10:00", a:"19:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:10},
  fatica:{km:0.2, gradini:0, ombra:"totale"},
  quando:"qualsiasi",
  perche:"Il souvenir onesto di Marsiglia: il vero savon de Marseille è fatto con olio d'oliva, soda "+
    "e acqua di mare, per legge del 1688, e ha impresso a fuoco il peso e la percentuale di olio. "+
    "Le botteghe del Panier e del Vieux-Port lo vendono ancora a cubi.",
  visita:["Cerca il marchio '72% d'huile' inciso sul cubo — è la garanzia",
          "Il sapone verde è all'olio d'oliva, quello bianco all'olio di palma","Diffida dei saponi profumati colorati: non sono quelli storici"],
  tips:["15 minuti, riempie un buco piccolo, e risolve i regali per tutti.",
        "Il sapone in stiva pesa: comprane pochi e buoni."],
  wc:"No", verificato:"2026-08-08", daVerificare:false
},

{
  id:"ms-bouillabaisse", nome:"Pranzo: bouillabaisse o pesce al Vieux-Port", scalo:"marsiglia",
  cat:["cibo","esperienze"], coord:[43.2940,5.3730], top:4,
  durata:{veloce:60, medio:90, lento:120},
  prezzo:45, prezzoNote:"La bouillabaisse vera costa €50–70 a persona. Un pesce alla griglia con "+
    "contorno sta sui €25–35.",
  orari:{da:"12:00", a:"14:30"}, chiusoGiorni:[], slot:false,
  prenota:{url:null, anticipoGiorni:5, note:"I ristoranti seri di bouillabaisse vogliono prenotazione e a volte preavviso di 24h."},
  saltafila:null, coda:{tipica:15, punta:40},
  fatica:{km:0.2, gradini:0, ombra:"totale"},
  quando:"pranzo",
  perche:"La zuppa di pesce di Marsiglia servita come si deve: prima il brodo con la rouille e i crostini, "+
    "poi il pesce sfilettato al tavolo. È un rituale da due ore e da 60 euro. La versione onesta ed "+
    "economica è un pesce del giorno alla griglia in una brasserie del porto.",
  visita:["Se scegli la bouillabaisse vera, cerca la 'Charte de la Bouillabaisse'",
          "Brodo e pesce si servono separati: è il segno che è quella giusta",
          "La rouille va spalmata sul crostino, non sciolta nel brodo"],
  tips:["⚠️ Budget: la bouillabaisse vera da sola supera i €100 a coppia. Con €100 di budget totale "+
        "ci mangi il budget intero. L'app te lo dirà.",
        "Alternativa economica: panisse (frittelle di ceci) e navettes, ~€8 a testa in piedi."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:false
},

{
  id:"ms-panisse", nome:"Panisse, navettes e pausa dolce", scalo:"marsiglia",
  cat:["cibo"], coord:[43.2960,5.3700], top:3,
  durata:{veloce:15, medio:25, lento:35},
  prezzo:8, prezzoNote:"~€5–10 a persona.",
  orari:{da:"09:00", a:"19:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:5, punta:15},
  fatica:{km:0.1, gradini:0, ombra:"variabile"},
  quando:"qualsiasi",
  perche:"Le panisse sono bastoncini di farina di ceci fritti, il cibo di strada storico del porto. "+
    "Le navettes sono biscotti secchi profumati ai fiori d'arancio a forma di barchetta, che a Marsiglia "+
    "si fanno da secoli nello stesso forno vicino a Saint-Victor.",
  visita:["Panisse calde, salate sopra","Navettes: durano settimane, ottimo souvenir da portare a casa"],
  tips:["È l'alternativa da €8 al pranzo da €45: se scegli l'If o Notre-Dame, mangia così.",
        "Il forno storico delle navettes sta sotto l'Abbaye Saint-Victor."],
  wc:"No", verificato:"2026-08-08", daVerificare:false
}

];
