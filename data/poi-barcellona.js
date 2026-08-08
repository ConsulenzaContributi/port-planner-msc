/* BARCELLONA — Martedì 29/09/2026 · 08:00–18:00 · tutti a bordo 17:00
   Solo Barcellona città. Giornata più densa dell'itinerario e la più cara.
   Prezzi in € a persona, stime 08/2026: RIVERIFICARE, a Barcellona salgono ogni anno. */

window.POI_barcellona = [

{
  id:"bc-sagrada", nome:"Sagrada Família", scalo:"barcellona",
  cat:["iconico","chiese","architettura"], coord:[41.4036,2.1744], top:5,
  durata:{veloce:75, medio:105, lento:150},
  prezzo:26, prezzoNote:"~€26 base a persona. Con salita alle torri ~€36. Audioguida inclusa nelle "+
    "tariffe superiori. È la voce di spesa più grossa della crociera.",
  orari:{da:"09:00", a:"18:00"}, chiusoGiorni:[], slot:true,
  prenota:{url:"https://sagradafamilia.org", anticipoGiorni:45,
    note:"⚠️ INGRESSO A FASCIA ORARIA OBBLIGATORIA. Nei mesi di punta i primi slot del mattino spariscono "+
         "con 1–2 mesi di anticipo. Prenota appena escono le date. Non esiste biglietteria last-minute affidabile."},
  saltafila:"Il biglietto online CON slot è già salta-fila. Non comprare da rivenditori terzi a prezzo gonfiato.",
  coda:{tipica:15, punta:40},
  fatica:{km:0.8, gradini:0, ombra:"totale dentro"},
  quando:"mattina",
  perche:"Non è una chiesa, è una foresta. Gaudí ha progettato colonne che si ramificano come alberi e "+
    "vetrate che al mattino inondano la navata di blu e verde e al pomeriggio di rosso e arancione. "+
    "Le foto non funzionano: bisogna starci dentro. Nel 2026 la torre di Gesù Cristo la rende la chiesa "+
    "più alta del mondo.",
  visita:["La luce: entra la mattina per i blu, il pomeriggio per i rossi",
          "Le colonne ramificate della navata, guardando in su al centro",
          "La facciata della Natività (lato est, quella di Gaudí) contro quella della Passione (ovest, di Subirachs)",
          "Il museo sotterraneo con i modelli a catenaria capovolti"],
  tips:["Sbarcando alle 08:00, uno slot alle 09:30–10:00 è perfetto: si entra freschi e con la luce giusta.",
        "Le torri costano €10 in più e richiedono ~30 min extra: valgono se il ritmo è Medio o Lento.",
        "Metro L5/L2 fermata Sagrada Família, dal Colom ~20 minuti.",
        "💶 Con budget €100 a coppia: questa da sola sono €52. Il resto della giornata dovrà essere quasi gratis."],
  wc:"Sì, dentro", verificato:"2026-08-08", daVerificare:true
},

{
  id:"bc-parkguell", nome:"Park Güell — zona monumentale", scalo:"barcellona",
  cat:["iconico","architettura","panorami","natura"], coord:[41.4145,2.1527], top:5,
  durata:{veloce:70, medio:100, lento:140},
  prezzo:11, prezzoNote:"~€10–18 a persona per la Zona Monumentale. Il resto del parco è gratuito.",
  orari:{da:"09:30", a:"17:30"}, chiusoGiorni:[], slot:true,
  prenota:{url:"https://parkguell.barcelona", anticipoGiorni:30,
    note:"Ingresso a fascia oraria con capienza limitata. Si entra entro 30 min dallo slot. Prenota almeno un mese prima."},
  saltafila:"Il biglietto con slot è l'unico modo di entrare senza rischio", coda:{tipica:10, punta:30},
  fatica:{km:2.0, gradini:150, ombra:"parziale"},
  quando:"pomeriggio",
  perche:"La città-giardino che Gaudí non riuscì a vendere e che divenne parco pubblico: la panca "+
    "serpentina ricoperta di trencadís, il drago-salamandra sulla scalinata, la sala ipostila con le "+
    "colonne storte. Dalla terrazza si vede Barcellona intera fino al mare.",
  visita:["La panca ondulata sulla terrazza — siediti, è pensata per essere comoda davvero",
          "El Drac, la salamandra della scalinata","Il soffitto a mosaico della Sala Ipostila",
          "Il Viadotto della Lavandaia, il porticato inclinato"],
  tips:["⚠️ È in collina e lontano: dal centro ~35–40 min tra metro e salita. Costa più tempo di quanto sembri.",
        "Sagrada + Park Güell nello stesso giorno con slot sbagliati = giornata passata in metro. "+
        "Se li volete entrambi, prendete Sagrada alle 09:30 e Park Güell dopo le 13:00.",
        "L'app vi avviserà se la combinazione non regge."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true
},

{
  id:"bc-gotic", nome:"Barri Gòtic — il quartiere gotico", scalo:"barcellona",
  cat:["quartieri","architettura","storia"], coord:[41.3833,2.1767], top:5,
  durata:{veloce:45, medio:80, lento:130},
  prezzo:0, prezzoNote:"Gratuito.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:2.0, gradini:20, ombra:"buona"},
  quando:"qualsiasi",
  perche:"Il nucleo romano e medievale della città: vicoli larghi due metri, cortili nascosti, resti "+
    "di mura romane inglobate nei palazzi. Comincia a 10 minuti da dove vi lascia il Portbus, non costa "+
    "niente, e con un budget stretto è la spina dorsale della vostra giornata.",
  visita:["Plaça Sant Felip Neri, con i segni delle schegge della bomba del 1938 sul muro",
          "Il Pont del Bisbe, il ponte neogotico più fotografato della città",
          "Plaça del Rei e la scalinata dove Colombo fu ricevuto al ritorno",
          "Le colonne del Tempio di Augusto, nascoste dentro un cortile in Carrer Paradís"],
  tips:["Ci si perde apposta: non serve un percorso.",
        "Costo zero e altissimo valore: è il POI che regge il budget di questa giornata.",
        "Attenzione a borseggiatori nelle vie più affollate e sulla Rambla."],
  wc:"Bar", verificato:"2026-08-08", daVerificare:false
},

{
  id:"bc-catedral", nome:"Cattedrale di Barcellona (La Seu)", scalo:"barcellona",
  cat:["chiese","architettura"], coord:[41.3839,2.1762], top:4,
  durata:{veloce:30, medio:50, lento:75},
  prezzo:11, prezzoNote:"~€9–14 a persona per la visita turistica (include chiostro, coro e terrazze).",
  orari:{da:"09:30", a:"18:30"}, chiusoGiorni:[], slot:false,
  prenota:{url:"https://catedralbcn.org", anticipoGiorni:1, note:"Biglietto online consigliato. Orari diversi per culto e turismo."},
  saltafila:"Online si evita la fila alla cassa", coda:{tipica:10, punta:30},
  fatica:{km:0.4, gradini:60, ombra:"totale"},
  quando:"qualsiasi",
  perche:"Gotico catalano puro, con un chiostro dove vivono tredici oche bianche — una per ogni anno "+
    "di vita di Santa Eulalia, martirizzata a tredici anni. Il chiostro con le palme, la fontana e le "+
    "oche è uno degli angoli più belli e più assurdi di Barcellona.",
  visita:["Il chiostro con le oche e la fontana","Il coro ligneo intagliato",
          "La cripta di Santa Eulalia sotto l'altare","Le terrazze sul tetto, se incluse nel biglietto"],
  tips:["Sta dentro il Gòtic: costo di inserimento quasi nullo.",
        "Se il budget stringe, la piazza e la facciata si vedono gratis e il chiostro a volte è "+
        "accessibile gratuitamente in alcune fasce orarie: verifica."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true
},

{
  id:"bc-boqueria", nome:"Mercat de la Boqueria", scalo:"barcellona",
  cat:["cibo","shopping","esperienze"], coord:[41.3818,2.1716], top:5,
  durata:{veloce:30, medio:50, lento:80},
  prezzo:0, prezzoNote:"Ingresso libero. Un cono di frutta €2, un banco di tapas €15–25 a testa.",
  orari:{da:"08:00", a:"20:00"}, chiusoGiorni:[0], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:0.6, gradini:0, ombra:"totale"},
  quando:"mattina",
  perche:"Il mercato coperto più famoso d'Europa, sulla Rambla dal 1840: piramidi di frutta tagliata, "+
    "banchi di jamón, pesce, funghi, e soprattutto i banconi dove si mangia in piedi accanto ai cuochi. "+
    "Il Pinotxo e i banchi storici in fondo sono l'esperienza vera, non i frullati all'ingresso.",
  visita:["I banconi di tapas in fondo a sinistra, non quelli all'ingresso",
          "Il banco dei funghi e delle erbe selvatiche","Il jamón ibérico de bellota tagliato al momento",
          "Le uova di quaglia e i pesci interi sul ghiaccio"],
  tips:["✅ Aperto il martedì (chiude la domenica).",
        "Vacci PRESTO: dopo le 11 è una calca. Sbarcando alle 08:00 potete arrivarci alle 09:00 quasi vuota.",
        "💶 Mangiare qui al bancone è il pranzo giusto per il budget: €20 a testa, veloce, e ottimo.",
        "Borseggiatori: è il posto numero uno di Barcellona. Zaino davanti."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:false
},

{
  id:"bc-santamaria", nome:"Santa Maria del Mar", scalo:"barcellona",
  cat:["chiese","architettura"], coord:[41.3838,2.1819], top:4,
  durata:{veloce:25, medio:40, lento:70},
  prezzo:0, prezzoNote:"Chiesa GRATUITA fuori dagli orari di visita guidata. La visita ai tetti costa ~€10–12.",
  orari:{da:"09:00", a:"20:00"}, chiusoGiorni:[], slot:false,
  prenota:{url:null, anticipoGiorni:3, note:"Solo per la visita guidata ai tetti e alla torre. La chiesa da sola non richiede prenotazione."},
  saltafila:null, coda:{tipica:0, punta:10},
  fatica:{km:0.3, gradini:0, ombra:"totale"},
  quando:"qualsiasi",
  perche:"La chiesa della 'Cattedrale del Mare': gotico catalano portato al limite, costruita in soli "+
    "55 anni dai portuali del quartiere che trasportavano a spalla le pietre da Montjuïc. Dentro non c'è "+
    "quasi niente, ed è per questo che è perfetta: solo colonne ottagonali altissime e spazio vuoto.",
  visita:["La distanza tra le colonne, la più ampia di tutto il gotico europeo",
          "Il rosone occidentale","Le tracce dell'incendio del 1936 sulle pietre annerite"],
  tips:["Gratis, bellissima, 25 minuti, in pieno Born. È il miglior rapporto qualità/prezzo della città.",
        "Se avete letto il romanzo di Falcones, qui è dove è ambientato."],
  wc:"No", verificato:"2026-08-08", daVerificare:true
},

{
  id:"bc-born", nome:"El Born e Passeig del Born", scalo:"barcellona",
  cat:["quartieri","shopping","cibo"], coord:[41.3850,2.1830], top:4,
  durata:{veloce:35, medio:60, lento:100},
  prezzo:0, prezzoNote:"Gratuito.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:1.5, gradini:0, ombra:"buona"},
  quando:"qualsiasi",
  perche:"Il quartiere dei mercanti medievali diventato la zona più piacevole della città: botteghe di "+
    "design, bar di vermut, il vecchio mercato di ferro trasformato in sito archeologico. Meno turistico "+
    "del Gòtic e più vivibile.",
  visita:["El Born Centre de Cultura: sotto la struttura in ferro c'è un intero quartiere del 1700 scavato (ingresso all'area libero)",
          "Carrer Montcada, la via dei palazzi gotici","I bar di vermut all'ora dell'aperitivo"],
  tips:["Confina con Santa Maria del Mar e col Museu Picasso: tre POI in 300 metri.",
        "È la zona giusta per l'ultimo giro prima di rientrare in nave."],
  wc:"Bar", verificato:"2026-08-08", daVerificare:false
},

{
  id:"bc-picasso", nome:"Museu Picasso", scalo:"barcellona",
  cat:["arte"], coord:[41.3851,2.1809], top:4,
  durata:{veloce:60, medio:90, lento:130},
  prezzo:15, prezzoNote:"~€14–15 a persona.",
  orari:{da:"09:00", a:"19:00"}, chiusoGiorni:[1], slot:true,
  prenota:{url:"https://museupicasso.bcn.cat", anticipoGiorni:7,
    note:"Fascia oraria consigliata. In alcune fasce serali/settimanali l'ingresso è gratuito: verifica il calendario."},
  saltafila:"Online con slot", coda:{tipica:15, punta:45},
  fatica:{km:0.4, gradini:40, ombra:"totale"},
  quando:"qualsiasi",
  perche:"Non il Picasso che vi aspettate: qui c'è il Picasso giovanissimo, quello accademico che a "+
    "quindici anni dipingeva meglio dei suoi professori. La collezione mostra la formazione e poi la "+
    "serie completa delle Meninas. Sta in cinque palazzi gotici uniti sulla Carrer Montcada.",
  visita:["Le opere accademiche degli anni di Barcellona — sconvolgenti per l'età",
          "La serie completa delle 58 Meninas","I cortili gotici dei palazzi, gratuiti"],
  tips:["✅ Aperto il martedì (chiude il lunedì).",
        "⚠️ Verifica le fasce a ingresso gratuito: possono farvi risparmiare €30 a coppia.",
        "Sta a 100 metri da Santa Maria del Mar: inserimento a costo zero."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true
},

{
  id:"bc-ciutadella", nome:"Parc de la Ciutadella e Arc de Triomf", scalo:"barcellona",
  cat:["natura","architettura","panorami"], coord:[41.3884,2.1860], top:3,
  durata:{veloce:30, medio:55, lento:90},
  prezzo:0, prezzoNote:"Gratuito.",
  orari:{da:"10:00", a:"20:30"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:1.8, gradini:20, ombra:"ottima"},
  quando:"pomeriggio",
  perche:"Il polmone verde del centro, con una cascata monumentale a cui lavorò il giovane Gaudí, un "+
    "laghetto con le barche a remi e l'Arco di Trionfo in mattoni rossi dell'Esposizione del 1888. "+
    "È il posto dove sedersi quando i piedi cedono.",
  visita:["La Cascada Monumental e il carro dell'Aurora","Il laghetto con le barche a remi (~€8 per 30 min in due)",
          "L'Hivernacle, la serra in ferro e vetro","L'Arc de Triomf e il viale di palme"],
  tips:["Gratis, ombreggiato, e sta accanto al Born: pausa perfetta a metà pomeriggio.",
        "Con budget stretto è il riempitivo di qualità della giornata."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:false
},

{
  id:"bc-barceloneta", nome:"Barceloneta e il lungomare", scalo:"barcellona",
  cat:["mare","quartieri","cibo"], coord:[41.3785,2.1925], top:3,
  durata:{veloce:35, medio:60, lento:110},
  prezzo:0, prezzoNote:"Gratuito. Un chiringuito costa quello che costa.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:2.2, gradini:0, ombra:"nessuna"},
  quando:"pomeriggio",
  perche:"Il vecchio quartiere dei pescatori a griglia stretta, e dietro la spiaggia urbana con il "+
    "lungomare fino al Port Olímpic. A fine settembre l'acqua è ancora perfetta e le spiagge si svuotano. "+
    "Il pesce fritto nei bar del quartiere è l'anti-turistico per eccellenza.",
  visita:["Le vie strette del quartiere, non il lungomare turistico","Il Peix dorato di Frank Gehry",
          "Una bomba (crocchetta piccante) in un bar del quartiere","La spiaggia di Sant Sebastià, la più tranquilla"],
  tips:["È vicino al punto dove vi lascia e riprende il Portbus: ideale come ULTIMA tappa prima del rientro.",
        "Se volete fare il bagno, portate il costume: a fine settembre si può."],
  wc:"Sulla spiaggia", verificato:"2026-08-08", daVerificare:false
},

{
  id:"bc-gracia", nome:"Passeig de Gràcia — le facciate moderniste", scalo:"barcellona",
  cat:["architettura","shopping"], coord:[41.3916,2.1650], top:4,
  durata:{veloce:30, medio:50, lento:80},
  prezzo:0, prezzoNote:"Gratuito se le guardi da fuori. Entrare in Casa Batlló o La Pedrera costa €28–45 a testa.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:1.5, gradini:0, ombra:"scarsa"},
  quando:"qualsiasi",
  perche:"Un chilometro di viale dove i borghesi di fine Ottocento si sfidarono a chi costruiva la casa "+
    "più folle. Nella 'Mansana de la Discòrdia' stanno accostate Casa Batlló di Gaudí (facciata di "+
    "ossa e squame di drago), Casa Amatller e Casa Lleó Morera. Dall'esterno è già uno spettacolo, "+
    "e dall'esterno è gratis.",
  visita:["Casa Batlló al numero 43 — la facciata del drago","Casa Amatller accanto, a gradoni fiamminghi",
          "La Pedrera / Casa Milà al 92, la facciata ondulata senza una linea retta",
          "I lampioni-panchina di Pere Falqués e le piastrelle esagonali di Gaudí sul marciapiede"],
  tips:["💶 LA SCELTA DELLA GIORNATA: con €100 a coppia, se fate la Sagrada dentro (€52), qui potete solo "+
        "guardare da fuori. Ed è comunque bellissimo.",
        "Sta sulla strada tra la Sagrada Família e il Gòtic: costo di inserimento basso.",
        "Casa Batlló è splendida di sera illuminata, ma voi ripartite alle 18:00."],
  wc:"No", verificato:"2026-08-08", daVerificare:false
},

{
  id:"bc-batllo", nome:"Casa Batlló (interno)", scalo:"barcellona",
  cat:["arte","architettura","iconico"], coord:[41.3917,2.1650], top:4,
  durata:{veloce:60, medio:85, lento:110},
  prezzo:35, prezzoNote:"~€29–45 a persona secondo la tipologia di biglietto. La più cara della città.",
  orari:{da:"09:00", a:"20:00"}, chiusoGiorni:[], slot:true,
  prenota:{url:"https://www.casabatllo.es", anticipoGiorni:14, note:"Fascia oraria obbligatoria. Prezzi dinamici: costa meno prenotando presto."},
  saltafila:"Esistono biglietti 'fast pass' più cari", coda:{tipica:20, punta:50},
  fatica:{km:0.3, gradini:80, ombra:"totale"},
  quando:"qualsiasi",
  perche:"L'interno di Gaudí più immersivo: il pozzo di luce piastrellato in gradazione di blu, la "+
    "scala che sembra la colonna vertebrale di un animale, il tetto a schiena di drago. Il percorso "+
    "con visore in realtà aumentata divide: c'è chi lo trova magico e chi invasivo.",
  visita:["Il patio di luce con i blu che sfumano dall'alto in basso","Il Salón Noble sul Passeig",
          "La terrazza sul tetto con i camini a trencadís","La scala di legno a spina di pesce"],
  tips:["⚠️ €70 a coppia: con budget €100 esclude quasi tutto il resto. Sceglietela SOLO se rinunciate alla Sagrada.",
        "Se dovete scegliere una sola casa di Gaudí e avete già la Sagrada, guardatela da fuori."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true
},

{
  id:"bc-palau", nome:"Palau de la Música Catalana", scalo:"barcellona",
  cat:["architettura","arte"], coord:[41.3875,2.1751], top:4,
  durata:{veloce:55, medio:70, lento:90},
  prezzo:22, prezzoNote:"~€20–24 a persona per la visita guidata di ~50 minuti.",
  orari:{da:"09:00", a:"15:30"}, chiusoGiorni:[], slot:true,
  prenota:{url:"https://www.palaumusica.cat", anticipoGiorni:14,
    note:"Solo con visita guidata a orario fisso, in gruppi. Prenota: gli slot in italiano/inglese si esauriscono."},
  saltafila:null, coda:{tipica:10, punta:20},
  fatica:{km:0.3, gradini:60, ombra:"totale"},
  quando:"mattina",
  perche:"L'altro modernismo, quello di Domènech i Montaner: una sala da concerto interamente in vetro "+
    "colorato, con un lucernario a goccia rovesciata che scende dal soffitto come un sole capovolto e "+
    "diciotto muse in mosaico che escono dalla parete del palco. È l'unica sala da concerto al mondo "+
    "illuminata di giorno solo da luce naturale.",
  visita:["Il lucernario centrale visto dal basso al centro della platea","Le muse in mosaico e ceramica dietro il palco",
          "La cavalcata delle Valchirie scolpita sul proscenio","La facciata con le colonne tutte diverse"],
  tips:["Chiude presto: le visite finiscono nel primo pomeriggio. Va messa la mattina.",
        "Sta a 5 minuti dal Gòtic e dal Born.",
        "Alternativa più economica ed elegante alla Casa Batlló: €44 a coppia invece di €70."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true
},

{
  id:"bc-bunkers", nome:"Bunkers del Carmel", scalo:"barcellona",
  cat:["panorami","storia"], coord:[41.4194,2.1616], top:3,
  durata:{veloce:60, medio:85, lento:120},
  prezzo:0, prezzoNote:"Gratuito. Costo: solo metro/bus.",
  orari:{da:"09:00", a:"19:30"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:2.0, gradini:200, ombra:"nessuna"},
  quando:"pomeriggio",
  perche:"Una batteria antiaerea della guerra civile in cima al Turó de la Rovira, da cui si vede "+
    "Barcellona a 360 gradi: la Sagrada, il mare, Montjuïc, tutto insieme. È il punto panoramico più "+
    "bello della città e non costa niente.",
  visita:["Il panorama a 360° dalla piattaforma","Le postazioni dei cannoni ancora in cemento",
          "La vista sulla Sagrada Família in asse"],
  tips:["⚠️ Salita ripida e senza ombra: pesante a inizio ottobre nel primo pomeriggio.",
        "Il quartiere ha chiesto di limitare l'affluenza: ci sono orari e regole. Verifica prima di salire.",
        "Non è vicino a niente: ~40 min dal centro. Ha senso solo con ritmo Veloce o se rinunciate ad altro."],
  wc:"No", verificato:"2026-08-08", daVerificare:true
},

{
  id:"bc-tapas", nome:"Pranzo: tapas e vermut", scalo:"barcellona",
  cat:["cibo","esperienze"], coord:[41.3830,2.1800], top:4,
  durata:{veloce:35, medio:60, lento:95},
  prezzo:25, prezzoNote:"~€18–30 a persona per tapas e una bevanda in un posto onesto.",
  orari:{da:"12:00", a:"16:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:15, punta:35},
  fatica:{km:0.2, gradini:0, ombra:"totale"},
  quando:"pranzo",
  perche:"Pan amb tomàquet, bombas, patatas bravas, croquetas, un vermut alla spina. In Catalogna il "+
    "vermut è un rito di mezzogiorno, non un aperitivo serale. Nei bar del Born e del Gòtic si mangia "+
    "bene a poco, purché ci si allontani di due strade dalla Rambla.",
  visita:["Chiedi il vermut 'de la casa', alla spina","Pan amb tomàquet: si strofina il pomodoro sul pane, non è salsa",
          "Evita i menu con le foto e i locali sulla Rambla"],
  tips:["💶 Con la Sagrada già a €52, tenete il pranzo sotto i €40 a coppia: la Boqueria al bancone è la scelta giusta.",
        "In Spagna si pranza tardi: alle 12:00 i locali sono vuoti, alle 14:00 pieni."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:false
},

{
  id:"bc-miespavello", nome:"Padiglione Mies van der Rohe (Pavelló Barcelona)", scalo:"barcellona",
  cat:["architettura","arte","iconico"], coord:[41.3745,2.1497], top:4,
  durata:{veloce:20, medio:35, lento:55},
  prezzo:8, prezzoNote:"~€8 a persona, ridotto ~€4,50 (dati 2024, RIVERIFICARE il prezzo 2026).",
  orari:{da:"10:00", a:"20:00"}, chiusoGiorni:[], slot:false,
  prenota:{url:"https://miesbcn.com", anticipoGiorni:0,
    note:"Biglietteria in loco, di solito senza fila lunga: non serve prenotare con anticipo."},
  saltafila:null, coda:{tipica:0, punta:10},
  fatica:{km:0.1, gradini:0, ombra:"parziale"},
  quando:"qualsiasi",
  perche:"Il padiglione tedesco per l'Esposizione Internazionale del 1929, smontato e poi ricostruito "+
    "fedelmente nel 1986: è il manifesto costruito del Movimento Moderno, con le sue lastre di marmo, "+
    "onice e travertino che sembrano fluttuare, il vetro che sparisce e la piscina con la scultura "+
    "'Alba' di Georg Kolbe. Si visita in 20-30 minuti ma è uno dei pochi posti della crociera dove vale "+
    "la pena fermarsi e stare fermi, non solo guardare.",
  visita:["La lastra di onice dorato retroilluminata, il fulcro visivo dell'edificio",
          "La 'Barcelona Chair', la poltrona disegnata apposta per il padiglione",
          "La piscina piccola con la scultura Alba di Georg Kolbe",
          "Il modo in cui i piani di marmo definiscono lo spazio senza vere pareti"],
  tips:["È a due passi dalle Fonts de Montjuïc e dal Poble Espanyol: si incastra bene con quella zona.",
        "Visita breve: 20-30 minuti bastano, non ha bisogno di più tempo per essere apprezzato.",
        "In stazione Espanya (L1/L3) o con l'autobus, a piedi dal Portbus è lontano: valutare i mezzi."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true,
  immagine:{
    url:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Barcelona_Pavilion_2013.jpg/1280px-Barcelona_Pavilion_2013.jpg",
    credito:"Wikimedia Commons"
  },
  fonti:[{titolo:"Sito ufficiale — miesbcn.com", url:"https://miesbcn.com"}]
}

];
