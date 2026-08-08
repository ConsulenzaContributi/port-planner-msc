/* NAPOLI — G1 imbarco (sab 26/09, partenza 16:30) e G8 sbarco (sab 03/10, arrivo 06:30)
   La Stazione Marittima è in centro: si esce a piedi.
   G1: la finestra utile dipende da quando lasciate i bagagli al check-in.
   G8: se non avete fretta di tornare a casa, avete mezza giornata regalata. */

window.POI_napoli = [

{
  id:"na-plebiscito", nome:"Piazza del Plebiscito e Galleria Umberto I", scalo:"napoli",
  cat:["architettura","iconico","quartieri"], coord:[40.8359,14.2488], top:5,
  durata:{veloce:25, medio:45, lento:70},
  prezzo:0, prezzoNote:"Gratuito.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:1.0, gradini:20, ombra:"scarsa in piazza"},
  quando:"qualsiasi",
  perche:"Dieci minuti a piedi dalla nave: l'emiciclo di San Francesco di Paola, il Palazzo Reale, e "+
    "dietro l'angolo la Galleria Umberto I con la cupola di ferro e vetro e il pavimento a mosaico "+
    "dello zodiaco. È il massimo che si può vedere in un'ora senza allontanarsi dal porto.",
  visita:["Il pavimento a mosaico dello zodiaco al centro della Galleria",
          "Il colonnato di San Francesco di Paola","La facciata del Palazzo Reale con gli otto re in nicchia",
          "Il Gran Caffè Gambrinus all'angolo — un caffè al banco, in piedi"],
  tips:["Perfetto per la mattina dell'imbarco: 45 minuti, tutto a piedi, si torna in nave in 10 min.",
        "Il Maschio Angioino è letteralmente sulla strada tra la nave e la piazza."],
  wc:"Nei bar", verificato:"2026-08-08", daVerificare:false,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Naples_galleria_umberto_I_bis.JPG/960px-Naples_galleria_umberto_I_bis.JPG?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Galleria Umberto I"}
},

{
  id:"na-maschio", nome:"Castel Nuovo (Maschio Angioino)", scalo:"napoli",
  cat:["storia","architettura"], coord:[40.8382,14.2525], top:4,
  durata:{veloce:35, medio:55, lento:80},
  prezzo:6, prezzoNote:"~€6 a persona. L'esterno e l'Arco di Trionfo si vedono gratis.",
  orari:{da:"08:30", a:"18:00"}, chiusoGiorni:[0], slot:false,
  prenota:null, saltafila:null, coda:{tipica:10, punta:20},
  fatica:{km:0.5, gradini:60, ombra:"parziale"},
  quando:"mattina",
  perche:"Il castello angioino a cinque torri che state guardando dalla nave: l'arco di trionfo "+
    "rinascimentale in marmo bianco incastrato tra due torri di pietra scura è uno degli innesti più "+
    "belli d'Italia. Dentro, la Sala dei Baroni ha una volta a ombrello di 28 metri.",
  visita:["L'Arco di Trionfo di Alfonso d'Aragona","La Sala dei Baroni e la volta a ombrello",
          "La Cappella Palatina","I camminamenti con vista sul porto e sulla nave"],
  tips:["⚠️ Chiuso la domenica — ma voi siete lì di sabato in entrambe le giornate. Bene.",
        "È a 5 minuti dalla Stazione Marittima: la tappa a minor costo di inserimento dell'itinerario."],
  wc:"Sì", verificato:"2026-08-08", daVerificare:true,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Maschio_angioino1.JPG/960px-Maschio_angioino1.JPG?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Maschio Angioino"}
},

{
  id:"na-toledo", nome:"Via Toledo e la stazione metro Toledo", scalo:"napoli",
  cat:["quartieri","shopping","arte"], coord:[40.8420,14.2490], top:4,
  durata:{veloce:30, medio:50, lento:80},
  prezzo:1.5, prezzoNote:"Gratis camminare. Un biglietto metro (~€1,30) per scendere a vedere la stazione.",
  orari:{da:"06:00", a:"23:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:1.5, gradini:60, ombra:"buona"},
  quando:"qualsiasi",
  perche:"La strada dello struscio napoletano, e sotto di essa una delle stazioni della metropolitana "+
    "più belle del mondo: il 'Crater de Luz' di Oscar Tusquets, un pozzo di mosaici blu che scende per "+
    "quaranta metri sotto il livello del mare, illuminato dall'alto. Si scende con un biglietto da un euro.",
  visita:["Il Crater de Luz visto dalla scala mobile, guardando in alto",
          "Il mosaico di Bill Culbert sulla parete","I Quartieri Spagnoli che si aprono sulla destra",
          "Una sfogliatella riccia calda in una pasticceria storica della via"],
  tips:["💶 Un euro e trenta per uno dei posti più fotografati d'Europa: il miglior affare del viaggio.",
        "I Quartieri Spagnoli sono lì accanto: strade a scacchiera ripidissime, molto fotogeniche."],
  wc:"Nei bar", verificato:"2026-08-08", daVerificare:false,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Toledo_%28Metropolitana_di_Napoli_L1%29.jpg/960px-Toledo_%28Metropolitana_di_Napoli_L1%29.jpg?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Toledo (metropolitana di Napoli)"}
},

{
  id:"na-sfogliatella", nome:"Sfogliatella, caffè e babà", scalo:"napoli",
  cat:["cibo","esperienze"], coord:[40.8390,14.2500], top:5,
  durata:{veloce:20, medio:30, lento:45},
  prezzo:6, prezzoNote:"~€4–8 a persona.",
  orari:{da:"07:00", a:"20:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:5, punta:20},
  fatica:{km:0.2, gradini:0, ombra:"totale"},
  quando:"qualsiasi",
  perche:"La sfogliatella riccia va mangiata calda, appena uscita, in piedi, e le scaglie di sfoglia "+
    "vi cadranno addosso: è previsto. Il caffè napoletano si beve al banco in due sorsi. È il modo "+
    "giusto di cominciare e chiudere la crociera.",
  visita:["Riccia (croccante) o frolla (morbida): la riccia è quella vera",
          "Il caffè si chiede 'normale' e arriva già zuccherato","Il babà al rum, se avete ancora spazio"],
  tips:["Sulla strada tra il porto e Piazza del Plebiscito ci sono pasticcerie storiche.",
        "Venti minuti, sei euro: l'app lo userà per riempire l'ultimo buco prima dell'imbarco."],
  wc:"No", verificato:"2026-08-08", daVerificare:false
},

{
  id:"na-gesu", nome:"Piazza del Gesù, Santa Chiara e Spaccanapoli", scalo:"napoli",
  cat:["chiese","quartieri","architettura"], coord:[40.8480,14.2530], top:5,
  durata:{veloce:50, medio:85, lento:130},
  prezzo:6, prezzoNote:"Chiese gratuite. Il Chiostro Maiolicato di Santa Chiara ~€6 a persona.",
  orari:{da:"09:30", a:"17:30"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:5, punta:20},
  fatica:{km:2.0, gradini:30, ombra:"buona nei vicoli"},
  quando:"mattina",
  perche:"Spaccanapoli è il decumano romano che taglia il centro antico in linea retta, ed è la Napoli "+
    "che tutti immaginano: vicoli stretti, panni stesi, edicole votive, presepi. Il Chiostro Maiolicato "+
    "di Santa Chiara è un giardino di pilastri rivestiti di maioliche settecentesche dipinte a mano.",
  visita:["Il Chiostro Maiolicato di Santa Chiara","La facciata a bugne di piperno del Gesù Nuovo",
          "L'obelisco dell'Immacolata","Via San Gregorio Armeno, la strada dei presepi"],
  tips:["⚠️ È a ~25 minuti a piedi dal porto: la tappa più lontana di questa lista.",
        "Ha senso solo il giorno dello SBARCO (G8), se restate a Napoli. Il giorno dell'imbarco è "+
        "troppo rischiosa con i bagagli e il check-in.",
        "Se avete mezza giornata al ritorno, è la cosa da fare."],
  wc:"Nei bar", verificato:"2026-08-08", daVerificare:true,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Spaccanapoli_da_s_Elmo_1050131.JPG/960px-Spaccanapoli_da_s_Elmo_1050131.JPG?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Spaccanapoli"}
},

{
  id:"na-lungomare", nome:"Lungomare Caracciolo e Castel dell'Ovo", scalo:"napoli",
  cat:["mare","panorami","quartieri"], coord:[40.8290,14.2470], top:4,
  durata:{veloce:45, medio:70, lento:110},
  prezzo:0, prezzoNote:"Gratuito, Castel dell'Ovo incluso.",
  orari:{da:"08:00", a:"19:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:2.5, gradini:40, ombra:"nessuna"},
  quando:"pomeriggio",
  perche:"Due chilometri e mezzo di lungomare pedonale con il Vesuvio davanti, che finisce sul Castel "+
    "dell'Ovo — il castello sull'isolotto dove secondo la leggenda Virgilio nascose un uovo magico che "+
    "regge la città. Si sale sui bastioni gratis e la vista sul golfo è quella delle cartoline.",
  visita:["I bastioni del Castel dell'Ovo, ingresso libero","Il Borgo Marinari con le barche",
          "Il Vesuvio in asse dal lungomare","Capri all'orizzonte se la giornata è limpida"],
  tips:["Gratis e bellissimo, ma è ~30 min a piedi dal porto in direzione opposta al centro.",
        "Ottima chiusura per il giorno dello sbarco se avete tempo."],
  wc:"Bar del Borgo", verificato:"2026-08-08", daVerificare:false,
  immagine:{url:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Via_Caracciolo_100_3932.JPG/960px-Via_Caracciolo_100_3932.JPG?utm_source=it.wikipedia.org&utm_campaign=api&utm_content=thumbnail", credito:"Wikipedia — Via Francesco Caracciolo"}
}

];
