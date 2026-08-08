/* PALERMO — Venerdì 02/10/2026 · 09:00–18:00 · tutti a bordo 17:00
   Solo Palermo città (Monreale e Mondello esclusi per scelta).
   Il porto è a ridosso del centro: si esce A PIEDI, costo trasporti = 0.
   Prezzi in € a persona, stime 08/2026: RIVERIFICARE. */

window.POI_palermo = [

{
  id:"pa-palatina", nome:"Palazzo dei Normanni e Cappella Palatina", scalo:"palermo",
  cat:["iconico","arte","chiese","storia"], coord:[38.1112,13.3532], top:5,
  durata:{veloce:70, medio:100, lento:145},
  prezzo:17, prezzoNote:"~€15,50–19,50 a persona secondo il giorno e se sono inclusi gli Appartamenti Reali.",
  orari:{da:"08:30", a:"16:30"}, chiusoGiorni:[], slot:true,
  prenota:{url:"https://www.federicosecondo.org", anticipoGiorni:14,
    note:"⚠️ Prenotazione con fascia oraria fortemente consigliata: è il monumento più visitato della Sicilia. "+
         "Gli Appartamenti Reali NON sono visitabili da martedì a giovedì per i lavori dell'Assemblea Regionale: "+
         "il VENERDÌ sì. Siete nel giorno giusto."},
  saltafila:"Il biglietto con slot online evita la fila, che a metà mattina è seria", coda:{tipica:20, punta:50},
  fatica:{km:1.8, gradini:80, ombra:"totale dentro"},
  quando:"mattina",
  perche:"La cosa più bella di Palermo e una delle più belle d'Italia: una cappella del 1140 in cui "+
    "Ruggero II fece lavorare insieme mosaicisti bizantini, maestranze arabe e architetti normanni. "+
    "Il risultato è un soffitto a muqarnas islamico sopra un Cristo Pantocratore greco dentro una "+
    "chiesa latina. Non esiste niente di simile da nessun'altra parte.",
  visita:["Il soffitto a muqarnas in legno dipinto — alzatevi lo sguardo e restateci",
          "Il Cristo Pantocratore dell'abside","Il pavimento in opus sectile di marmi e porfido",
          "La Sala di Ruggero con i mosaici profani di caccia — negli Appartamenti Reali, visitabili di venerdì",
          "Il candelabro pasquale in marmo scolpito"],
  tips:["✅ VENERDÌ = Appartamenti Reali aperti. È il colpo di fortuna dell'itinerario: sfruttatelo.",
        "Chiude presto (~16:30, ultimo ingresso prima): va messo la mattina, non nel pomeriggio.",
        "È il punto più lontano del centro storico: ~25 min a piedi dal porto. Ci si arriva scendendo il Cassaro.",
        "Spalle coperte per entrambi: è un luogo di culto."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true
},

{
  id:"pa-cattedrale", nome:"Cattedrale di Palermo", scalo:"palermo",
  cat:["chiese","architettura","iconico"], coord:[38.1144,13.3563], top:5,
  durata:{veloce:35, medio:60, lento:90},
  prezzo:12, prezzoNote:"Chiesa GRATUITA. Il percorso completo (tetti + cripta + tombe reali + tesoro) ~€12–15 a persona. "+
    "I singoli percorsi si comprano anche separati da ~€5.",
  orari:{da:"09:00", a:"17:30"}, chiusoGiorni:[], slot:false,
  prenota:{url:"https://www.cattedrale.palermo.it", anticipoGiorni:3,
    note:"La salita ai tetti ha posti limitati per fascia oraria: meglio prenotare."},
  saltafila:null, coda:{tipica:10, punta:30},
  fatica:{km:0.5, gradini:120, ombra:"totale dentro, nessuna sui tetti"},
  quando:"qualsiasi",
  perche:"Una cattedrale che ha cambiato religione e stile ogni due secoli e le ha tenute tutte: base "+
    "normanna, merlature arabe, portico gotico-catalano, cupola settecentesca. Su una colonna del portico "+
    "sud c'è ancora incisa una sura del Corano, perché prima era una moschea. Dai tetti si vede tutta la "+
    "Conca d'Oro.",
  visita:["La colonna con l'iscrizione coranica nel portico sud — cercatela, è lì da nove secoli",
          "Le tombe imperiali di porfido: Federico II, Ruggero II, Costanza d'Altavilla",
          "La meridiana ottocentesca sul pavimento della navata","I tetti, per il panorama a 360°"],
  tips:["💶 La chiesa da sola è gratis ed è già bellissima. I tetti sono il vero acquisto: €24 a coppia.",
        "Sta sul Cassaro, tra il porto e Palazzo dei Normanni: si incastra perfettamente in mezzo.",
        "I tetti a inizio ottobre nel primo pomeriggio sono roventi: fatelo la mattina o alle 16."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true
},

{
  id:"pa-quattrocanti", nome:"Quattro Canti, Fontana Pretoria e Piazza Bellini", scalo:"palermo",
  cat:["architettura","iconico","quartieri"], coord:[38.1157,13.3614], top:5,
  durata:{veloce:25, medio:40, lento:60},
  prezzo:0, prezzoNote:"Gratuito.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:0.4, gradini:10, ombra:"parziale"},
  quando:"qualsiasi",
  perche:"L'incrocio barocco dove le due strade principali si tagliano e i quattro angoli sono quattro "+
    "facciate concave identiche, una per stagione, per santa e per re spagnolo. A cinquanta metri, la "+
    "Fontana Pretoria con le sue cinquanta statue nude che scandalizzarono le monache del convento "+
    "accanto: la chiamano ancora la Fontana della Vergogna.",
  visita:["I Quattro Canti: mettiti al centro dell'incrocio e gira su te stesso",
          "La Fontana Pretoria dal lato alto, verso il municipio","Piazza Bellini con le tre chiese affiancate",
          "Il Genio di Palermo scolpito, se lo trovi"],
  tips:["Costo zero, sta esattamente al centro di tutto: è il crocevia della vostra giornata.",
        "Nelle ore centrali la luce sui Quattro Canti è piatta: meglio mattina presto o tardo pomeriggio."],
  wc:"Bar", verificato:"2026-08-08", daVerificare:false
},

{
  id:"pa-martorana", nome:"La Martorana e San Cataldo", scalo:"palermo",
  cat:["chiese","arte","architettura"], coord:[38.1150,13.3624], top:5,
  durata:{veloce:30, medio:45, lento:70},
  prezzo:5, prezzoNote:"~€2–3 a persona ciascuna. Due chiese affiancate, biglietti separati.",
  orari:{da:"09:30", a:"17:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:5, punta:15},
  fatica:{km:0.2, gradini:30, ombra:"totale"},
  quando:"qualsiasi",
  perche:"Due gioielli attaccati in Piazza Bellini. La Martorana ha mosaici bizantini del 1140 che "+
    "rivaleggiano con quelli della Palatina, incluso Ruggero II incoronato direttamente da Cristo — "+
    "propaganda politica in oro. San Cataldo accanto è l'opposto: tre cupole rosse arabe e un interno "+
    "di pietra nuda, completamente spoglio.",
  visita:["Il Cristo Pantocratore della cupola della Martorana","Ruggero II incoronato da Cristo, mosaico politico",
          "Le tre cupole rosse di San Cataldo dall'esterno","Il pavimento cosmatesco di San Cataldo"],
  tips:["💶 Cinque euro a testa per due capolavori: il miglior rapporto valore/prezzo di tutta la crociera.",
        "Sono a 80 metri dai Quattro Canti: costo di inserimento praticamente nullo.",
        "La Martorana è chiesa di rito greco-bizantino attiva: verifica gli orari delle liturgie."],
  wc:"No", verificato:"2026-08-08", daVerificare:true
},

{
  id:"pa-ballaro", nome:"Mercato di Ballarò", scalo:"palermo",
  cat:["cibo","quartieri","esperienze"], coord:[38.1105,13.3583], top:5,
  durata:{veloce:35, medio:60, lento:90},
  prezzo:0, prezzoNote:"Ingresso libero. Street food €3–8 a porzione.",
  orari:{da:"07:00", a:"20:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:1.2, gradini:0, ombra:"buona sotto i teli"},
  quando:"mattina",
  perche:"Il mercato più antico e più vivo di Palermo, con l'abbanniata — il grido cantato dei venditori "+
    "che è un residuo diretto dei suq arabi. Teli tesi tra i palazzi, banchi di pesce e frutta, "+
    "friggitorie che lavorano dalle sette del mattino. Non è messo in scena per i turisti: è la spesa "+
    "quotidiana del quartiere Albergheria.",
  visita:["L'abbanniata dei venditori — ascoltala, è mezza in arabo",
          "I banchi delle friggitorie: panelle, crocché, sfincione","Le stigghiola alla brace nel pomeriggio",
          "I banchi di pesce spada e tonno interi"],
  tips:["È sulla strada tra Palazzo dei Normanni e i Quattro Canti: inserimento gratuito.",
        "💶 Qui si pranza con €15 in due, benissimo. Il budget di Palermo si regge da solo.",
        "Vivo tutto il giorno, ma la mattina è il momento vero."],
  wc:"Bar", verificato:"2026-08-08", daVerificare:false
},

{
  id:"pa-capo", nome:"Mercato del Capo", scalo:"palermo",
  cat:["cibo","quartieri"], coord:[38.1180,13.3565], top:4,
  durata:{veloce:30, medio:45, lento:70},
  prezzo:0, prezzoNote:"Ingresso libero.",
  orari:{da:"07:00", a:"19:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:1.0, gradini:0, ombra:"buona"},
  quando:"mattina",
  perche:"L'alternativa a Ballarò, alle spalle della Cattedrale: più stretto, più cupo, più "+
    "cinematografico. Termina nella bellissima Porta Carini e attraversa un quartiere popolare "+
    "intatto. Se avete già fatto Ballarò, questo è il doppione — sceglietene uno.",
  visita:["Porta Carini all'estremità nord","Le friggitorie storiche del Capo","La Chiesa dell'Immacolata Concezione, barocco nascosto"],
  tips:["Doppione di Ballarò: l'app vi segnalerà la ridondanza e ve ne farà scegliere uno.",
        "Sta dietro la Cattedrale: comodo se scendete dai tetti."],
  wc:"Bar", verificato:"2026-08-08", daVerificare:false
},

{
  id:"pa-streetfood", nome:"Pranzo: street food palermitano", scalo:"palermo",
  cat:["cibo","esperienze","iconico"], coord:[38.1150,13.3600], top:5,
  durata:{veloce:30, medio:50, lento:75},
  prezzo:12, prezzoNote:"~€8–18 a persona mangiando benissimo. Il pasto più economico della crociera.",
  orari:{da:"11:00", a:"16:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:10, punta:25},
  fatica:{km:0.3, gradini:0, ombra:"variabile"},
  quando:"pranzo",
  perche:"Palermo è la capitale europea del cibo di strada e non è un modo di dire. Panelle e crocché, "+
    "sfincione, arancine (femminile, a Palermo), pane ca' meusa per i coraggiosi, e il cannolo riempito "+
    "davanti a voi al momento — mai prima, o la cialda si ammoscia.",
  visita:["Arancina al burro o alla carne: a Palermo è tonda e femminile",
          "Lo sfincione: focaccia alta con cipolla, acciuga e caciocavallo",
          "Il pane ca' meusa: milza in strutto. 'Schettu' (semplice) o 'maritatu' (con ricotta)",
          "Il cannolo: la cialda va riempita al momento, altrimenti andate altrove"],
  tips:["💶 Con €100 di budget e trasporti a €0, a Palermo potete permettervi tutto. Questo è il pranzo giusto lo stesso.",
        "Le friggitorie migliori stanno nei mercati e attorno ai Quattro Canti.",
        "Alternativa gratis: rientrare a bordo per pranzo. Sono 20 minuti a piedi e il pranzo è incluso."],
  wc:"Bar", verificato:"2026-08-08", daVerificare:false
},

{
  id:"pa-massimo", nome:"Teatro Massimo", scalo:"palermo",
  cat:["architettura","arte","iconico"], coord:[38.1196,13.3573], top:4,
  durata:{veloce:40, medio:55, lento:75},
  prezzo:14, prezzoNote:"~€12–15 a persona per la visita guidata di ~30 minuti.",
  orari:{da:"09:30", a:"18:00"}, chiusoGiorni:[], slot:true,
  prenota:{url:"https://www.teatromassimo.it", anticipoGiorni:7,
    note:"Visite guidate a turni fissi, in gruppi, in più lingue. Prenota lo slot: nei giorni di prova le visite saltano."},
  saltafila:null, coda:{tipica:10, punta:25},
  fatica:{km:0.4, gradini:60, ombra:"totale"},
  quando:"pomeriggio",
  perche:"Il più grande teatro lirico d'Italia e il terzo d'Europa, con una scalinata monumentale e i "+
    "leoni di bronzo che chiunque abbia visto Il Padrino Parte III riconosce all'istante — la scena "+
    "finale è girata qui. La sala ha un soffitto a petali mobili che si aprono per la ventilazione.",
  visita:["La sala grande e il soffitto a 'ruota di bicicletta' con i petali apribili",
          "La Sala Pompeiana, dove l'acustica fa sentire la propria voce amplificata stando al centro",
          "La scalinata esterna con i leoni — la scena del Padrino","I palchi reali"],
  tips:["Sta a metà strada tra il porto e i Quattro Canti: comodissimo in uscita o in rientro.",
        "Prova il trucco acustico nella Sala Pompeiana: mettetevi al centro del cerchio e parlate."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true
},

{
  id:"pa-abatellis", nome:"Palazzo Abatellis — Galleria Regionale", scalo:"palermo",
  cat:["arte","architettura"], coord:[38.1155,13.3697], top:4,
  durata:{veloce:50, medio:80, lento:120},
  prezzo:8, prezzoNote:"~€8 a persona.",
  orari:{da:"09:00", a:"18:30"}, chiusoGiorni:[1], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:10},
  fatica:{km:0.8, gradini:50, ombra:"totale"},
  quando:"pomeriggio",
  perche:"Un palazzo gotico-catalano allestito negli anni Cinquanta da Carlo Scarpa, e l'allestimento "+
    "è famoso quanto le opere. Dentro c'è il Trionfo della Morte, un affresco enorme del Quattrocento "+
    "con la Morte a cavallo che falcia i ricchi — Picasso lo studiò prima di Guernica — e l'Annunciata "+
    "di Antonello da Messina, che è forse il ritratto più moderno del Rinascimento italiano.",
  visita:["L'Annunciata di Antonello da Messina — il gesto della mano, il velo blu. Da sola vale il biglietto",
          "Il Trionfo della Morte, in una sala pensata da Scarpa apposta",
          "Il busto di Eleonora d'Aragona di Laurana","L'allestimento di Scarpa: guardate come sono appese le opere"],
  tips:["✅ Aperto il venerdì (chiude il lunedì).",
        "È verso la Kalsa, sulla strada del rientro al porto: costo di inserimento basso.",
        "Se scegliete un solo museo a Palermo, che sia questo."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true
},

{
  id:"pa-serpotta", nome:"Oratori del Serpotta (Santa Cita e San Lorenzo)", scalo:"palermo",
  cat:["arte","chiese"], coord:[38.1218,13.3640], top:4,
  durata:{veloce:35, medio:55, lento:80},
  prezzo:7, prezzoNote:"~€5–8 a persona; esistono biglietti cumulativi per più oratori.",
  orari:{da:"10:00", a:"18:00"}, chiusoGiorni:[0], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:10},
  fatica:{km:0.6, gradini:20, ombra:"totale"},
  quando:"pomeriggio",
  perche:"Giacomo Serpotta modellava lo stucco come se fosse zucchero: interi ambienti tappezzati di "+
    "putti che ridono, si arrampicano, si annoiano e vi guardano. Sono piccole stanze e nessuno le "+
    "conosce, il che le rende ancora più sorprendenti. Nell'Oratorio di San Lorenzo c'era la Natività "+
    "di Caravaggio, rubata nel 1969 e mai ritrovata: al suo posto c'è una copia.",
  visita:["I putti del Serpotta: cercate quello che si è addormentato",
          "L'allegoria della Fortezza con lo specchio","La copia della Natività rubata di Caravaggio a San Lorenzo",
          "Il pavimento in marmi mischi"],
  tips:["Sono nascosti in vicoli laterali: usate la mappa dell'app o li mancate.",
        "Vicini alla Vucciria e al porto: perfetti come ultima tappa prima del rientro.",
        "Verifica gli orari: sono gestiti da associazioni e possono variare."],
  wc:"No", verificato:"2026-08-08", daVerificare:true
},

{
  id:"pa-catacombe", nome:"Catacombe dei Cappuccini", scalo:"palermo",
  cat:["storia","esperienze"], coord:[38.1114,13.3378], top:4,
  durata:{veloce:50, medio:70, lento:95},
  prezzo:5, prezzoNote:"~€5 a persona, contanti spesso preferiti.",
  orari:{da:"09:00", a:"17:30"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:10, punta:25},
  fatica:{km:2.5, gradini:40, ombra:"totale"},
  quando:"pomeriggio",
  perche:"Ottomila corpi mummificati appesi ai muri di corridoi sotterranei, vestiti con gli abiti "+
    "buoni e divisi per categoria sociale: frati, professionisti, vergini, bambini. L'ultima è Rosalia "+
    "Lombardo, morta a due anni nel 1920 e conservata così bene da sembrare addormentata. È disturbante "+
    "e indimenticabile.",
  visita:["Il corridoio dei professionisti","La cappella delle vergini","Rosalia Lombardo, l'ultima sala"],
  tips:["⚠️ Non è per tutti: se uno dei due è impressionabile, saltatelo senza sensi di colpa.",
        "È fuori dal centro storico, ~30 min a piedi o 15 in bus/taxi da Palazzo dei Normanni.",
        "Vietato fotografare. Rispettatelo: è un cimitero."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true
},

{
  id:"pa-kalsa", nome:"La Kalsa e il Foro Italico", scalo:"palermo",
  cat:["quartieri","mare","panorami"], coord:[38.1140,13.3690], top:3,
  durata:{veloce:35, medio:60, lento:95},
  prezzo:0, prezzoNote:"Gratuito.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:2.0, gradini:0, ombra:"scarsa sul Foro"},
  quando:"pomeriggio",
  perche:"Il quartiere arabo-normanno più ferito dai bombardamenti del '43 e oggi il più interessante: "+
    "palazzi sventrati accanto a palazzi restaurati, giardini nascosti, e lo Spasimo, una chiesa senza "+
    "tetto con gli alberi che crescono dentro la navata. Sbocca sul Foro Italico, il prato sul mare "+
    "dove i palermitani passeggiano.",
  visita:["Lo Spasimo: chiesa gotica a cielo aperto con gli alberi dentro",
          "Piazza Marina e il Giardino Garibaldi col ficus magnoloide gigantesco",
          "Il Foro Italico al tramonto","Palazzo Chiaramonte-Steri e i graffiti dei prigionieri dell'Inquisizione"],
  tips:["È tra il centro e il porto: la strada naturale del rientro a bordo.",
        "Il ficus di Piazza Marina è uno degli alberi più grandi d'Europa: sembra un set di film.",
        "Gratis, panoramico e rilassante: ideale come ultima tappa con ritmo Lento."],
  wc:"Bar", verificato:"2026-08-08", daVerificare:false
},

{
  id:"pa-orto", nome:"Orto Botanico", scalo:"palermo",
  cat:["natura","storia"], coord:[38.1113,13.3733], top:3,
  durata:{veloce:45, medio:70, lento:110},
  prezzo:7, prezzoNote:"~€7 a persona.",
  orari:{da:"09:00", a:"18:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:10},
  fatica:{km:1.5, gradini:0, ombra:"eccellente"},
  quando:"pomeriggio",
  perche:"Uno degli orti botanici accademici più importanti d'Europa, fondato nel 1789: dieci ettari "+
    "di piante tropicali cresciute in modo assurdo grazie al clima, con un ficus magnoloide le cui radici "+
    "aeree formano una foresta da sole. È il posto più fresco e silenzioso della città.",
  visita:["Il Ficus macrophylla e le sue radici aeree","Il Gymnasium neoclassico all'ingresso",
          "L'acquarium con le piante acquatiche","Il viale delle palme"],
  tips:["Ombra vera: è la carta giusta per le ore calde del primo pomeriggio.",
        "Sta accanto alla Kalsa, sulla strada del rientro.",
        "Con ritmo Lento è perfetto; con ritmo Veloce l'app lo scarterà."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true
},

{
  id:"pa-vucciria", nome:"Vucciria e i vicoli del Castellammare", scalo:"palermo",
  cat:["quartieri","cibo"], coord:[38.1198,13.3648], top:3,
  durata:{veloce:25, medio:40, lento:60},
  prezzo:0, prezzoNote:"Gratuito.",
  orari:{da:"09:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:0.8, gradini:0, ombra:"parziale"},
  quando:"pomeriggio",
  perche:"Il mercato che Guttuso dipinse nel 1974 quando era il più ricco della città, e che oggi di "+
    "giorno è quasi spento: quattro banchi, muri scrostati, panni stesi. Di sera diventa il posto della "+
    "movida. Ci si passa perché è a due minuti dal porto e perché quel decadimento è comunque Palermo.",
  visita:["Piazza Caracciolo, il centro del mercato","Le stigghiola alla brace nel tardo pomeriggio",
          "I murales sui palazzi diroccati"],
  tips:["Di giorno è poco: mettetelo solo come passaggio, non come tappa.",
        "È a 10 minuti dal varco del porto: ultimo giro possibile prima del rientro."],
  wc:"Bar", verificato:"2026-08-08", daVerificare:false
}

];
