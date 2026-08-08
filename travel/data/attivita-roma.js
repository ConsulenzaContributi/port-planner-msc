/* ATTIVITA — Roma. Catalogo di esempio (stesso formato di data/poi-*.js nel
   progetto crociera), campo "tappa" invece di "scalo". In produzione questo
   file viene sostituito/integrato dalla ricerca dinamica (vedi js/ricerca-attivita.js)
   che interroga Google Places nel raggio scelto dall'alloggio della tappa. */

window.ATTIVITA_roma = [

{
  id:"rm-colosseo", nome:"Colosseo", tappa:"roma",
  cat:["iconico","storia","architettura"], coord:[41.8902,12.4922], top:5,
  durata:{veloce:60, medio:90, lento:130},
  prezzo:18, prezzoNote:"Biglietto Colosseo+Foro+Palatino, valido 24h.",
  orari:{da:"09:00", a:"19:00"}, chiusoGiorni:[], slot:true,
  prenota:{url:"https://colosseo.it", anticipoGiorni:7, note:"Fasce orarie: prenota con anticipo in alta stagione."},
  saltafila:"Ingresso prioritario disponibile a pagamento.", coda:{tipica:20, punta:60},
  fatica:{km:0.5, gradini:40, ombra:"scarsa"},
  quando:"mattina",
  perche:"Il simbolo di Roma antica: l'anfiteatro più grande mai costruito dall'impero.",
  visita:["Arena e ipogei","Anello superiore con vista","Arco di Costantino appena fuori"],
  tips:["Biglietto combinato con Foro Romano e Palatino, valido lo stesso giorno o il successivo.",
        "Arriva alle 8:30 per evitare la fila peggiore."],
  wc:"All'interno", verificato:"2026-08-08", daVerificare:true
},

{
  id:"rm-pantheon", nome:"Pantheon", tappa:"roma",
  cat:["iconico","architettura","storia"], coord:[41.8986,12.4769], top:5,
  durata:{veloce:15, medio:25, lento:40},
  prezzo:5, prezzoNote:"Ingresso a pagamento dal 2023.",
  orari:{da:"09:00", a:"19:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:10, punta:25},
  fatica:{km:0.1, gradini:0, ombra:"nessuna"},
  quando:"qualsiasi",
  perche:"La cupola in cemento romano più grande mai costruita senza armatura in acciaio, 2000 anni dopo.",
  visita:["L'oculo centrale","Le tombe reali e di Raffaello"],
  tips:["Piazza della Rotonda intorno è perfetta per un caffè."],
  wc:"Nei bar della piazza", verificato:"2026-08-08", daVerificare:true
},

{
  id:"rm-trastevere", nome:"Passeggiata a Trastevere", tappa:"roma",
  cat:["quartieri","cibo"], coord:[41.8896,12.4695], top:4,
  durata:{veloce:40, medio:70, lento:110},
  prezzo:0, prezzoNote:"Gratuita, a piedi.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:2.0, gradini:0, ombra:"parziale"},
  quando:"pomeriggio",
  perche:"Il quartiere più autentico del centro storico, ciottoli e vicoli, ottimo la sera.",
  visita:["Piazza di Santa Maria in Trastevere","Vicolo del Cinque"],
  tips:["A cena si riempie: prenota o vai presto."],
  wc:"Bar della zona", verificato:"2026-08-08", daVerificare:false
},

{
  id:"rm-vaticani", nome:"Musei Vaticani e Cappella Sistina", tappa:"roma",
  cat:["arte","iconico"], coord:[41.9065,12.4536], top:5,
  durata:{veloce:100, medio:150, lento:220},
  prezzo:20, prezzoNote:"Biglietto online consigliato per evitare la fila esterna.",
  orari:{da:"08:00", a:"18:00"}, chiusoGiorni:[0], slot:true,
  prenota:{url:"https://museivaticani.va", anticipoGiorni:14, note:"Fascia oraria obbligatoria, molto richiesta."},
  saltafila:"Ingresso salta fila a pagamento fortemente consigliato.", coda:{tipica:45, punta:120},
  fatica:{km:2.5, gradini:60, ombra:"buona"},
  quando:"mattina",
  perche:"Una delle più grandi collezioni d'arte al mondo, culmina nella Cappella Sistina di Michelangelo.",
  visita:["Stanze di Raffaello","Galleria delle Carte Geografiche","Cappella Sistina"],
  tips:["Chiuso la domenica (tranne ultima domenica del mese, gratuita e affollatissima)."],
  wc:"Interni", verificato:"2026-08-08", daVerificare:true
},

{
  id:"rm-carbonara", nome:"Pranzo: Carbonara a Testaccio", tappa:"roma",
  cat:["cibo"], coord:[41.8767,12.4756], top:4,
  durata:{veloce:35, medio:50, lento:75},
  prezzo:18, prezzoNote:"Trattoria tipica, primo + bevanda.",
  orari:{da:"12:00", a:"15:00"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:5, punta:20},
  fatica:{km:0.2, gradini:0, ombra:"nessuna"},
  quando:"pranzo",
  perche:"Testaccio è il quartiere dove la cucina romana è nata: qui la carbonara è quella vera.",
  visita:["Mercato di Testaccio a due passi"],
  tips:["Vai prima delle 12:30 o dopo le 14 per trovare posto senza attesa."],
  wc:"Interno", verificato:"2026-08-08", daVerificare:false
}
];
