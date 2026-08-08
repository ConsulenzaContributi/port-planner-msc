/* ATTIVITA — Firenze. Catalogo di esempio, stesso formato di attivita-roma.js. */

window.ATTIVITA_firenze = [

{
  id:"fi-duomo", nome:"Duomo e Cupola del Brunelleschi", tappa:"firenze",
  cat:["iconico","architettura"], coord:[43.7731,11.2560], top:5,
  durata:{veloce:40, medio:70, lento:110},
  prezzo:20, prezzoNote:"Biglietto cumulativo Duomo+Cupola+Battistero+Campanile+Museo.",
  orari:{da:"08:15", a:"19:30"}, chiusoGiorni:[], slot:true,
  prenota:{url:"https://duomo.firenze.it", anticipoGiorni:5, note:"Salita alla cupola a fascia oraria obbligatoria."},
  saltafila:null, coda:{tipica:25, punta:60},
  fatica:{km:0.3, gradini:463, ombra:"nessuna"},
  quando:"mattina",
  perche:"La cupola più grande mai costruita in muratura, capolavoro di ingegneria rinascimentale.",
  visita:["Interno della cattedrale","Salita alla cupola con vista su Firenze","Battistero con le Porte del Paradiso"],
  tips:["I 463 gradini della cupola sono impegnativi: niente zaini grandi."],
  wc:"Nei pressi", verificato:"2026-08-08", daVerificare:true
},

{
  id:"fi-uffizi", nome:"Galleria degli Uffizi", tappa:"firenze",
  cat:["arte","iconico"], coord:[43.7678,11.2553], top:5,
  durata:{veloce:80, medio:130, lento:200},
  prezzo:25, prezzoNote:"Prenotazione online fortemente consigliata.",
  orari:{da:"08:15", a:"18:30"}, chiusoGiorni:[1], slot:true,
  prenota:{url:"https://uffizi.it", anticipoGiorni:10, note:"Fascia oraria, si riempie mesi prima in alta stagione."},
  saltafila:"Salta fila incluso nella prenotazione online.", coda:{tipica:30, punta:90},
  fatica:{km:1.0, gradini:20, ombra:"buona"},
  quando:"mattina",
  perche:"Una delle collezioni di arte rinascimentale più importanti al mondo: Botticelli, Leonardo, Michelangelo.",
  visita:["La Nascita di Venere di Botticelli","Annunciazione di Leonardo","Corridoio vasariano (se aperto)"],
  tips:["Chiuso il lunedì."],
  wc:"Interni", verificato:"2026-08-08", daVerificare:true
},

{
  id:"fi-ponte-vecchio", nome:"Ponte Vecchio e Oltrarno", tappa:"firenze",
  cat:["iconico","quartieri","panorami"], coord:[43.7680,11.2531], top:5,
  durata:{veloce:20, medio:45, lento:80},
  prezzo:0, prezzoNote:"Gratuito, si attraversa a piedi.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:1.2, gradini:0, ombra:"scarsa"},
  quando:"pomeriggio",
  perche:"L'unico ponte fiorentino sopravvissuto alla guerra, con le storiche botteghe orafe.",
  visita:["Botteghe orafe sul ponte","Quartiere Oltrarno con botteghe artigiane"],
  tips:["Il tramonto dal ponte verso l'Arno è tra i più fotografati d'Italia."],
  wc:"Bar della zona", verificato:"2026-08-08", daVerificare:false
},

{
  id:"fi-piazzale-michelangelo", nome:"Piazzale Michelangelo", tappa:"firenze",
  cat:["panorami"], coord:[43.7629,11.2650], top:5,
  durata:{veloce:20, medio:40, lento:60},
  prezzo:0, prezzoNote:"Gratuito.",
  orari:{da:"00:00", a:"23:59"}, chiusoGiorni:[], slot:false,
  prenota:null, saltafila:null, coda:{tipica:0, punta:0},
  fatica:{km:1.0, gradini:120, ombra:"scarsa"},
  quando:"pomeriggio",
  perche:"Il miglior panorama su Firenze, specialmente al tramonto.",
  visita:["Vista sulla città e sul Duomo da lontano"],
  tips:["Ci si arriva anche in autobus se non si vuole salire a piedi."],
  wc:"No", verificato:"2026-08-08", daVerificare:false
},

{
  id:"fi-bistecca", nome:"Cena: Bistecca alla fiorentina", tappa:"firenze",
  cat:["cibo"], coord:[43.7745,11.2540], top:4,
  durata:{veloce:50, medio:80, lento:110},
  prezzo:35, prezzoNote:"Bistecca alla fiorentina si paga a etto, prezzo indicativo a persona.",
  orari:{da:"19:00", a:"22:30"}, chiusoGiorni:[], slot:false,
  prenota:{url:null, anticipoGiorni:1, note:"Consigliata prenotazione, soprattutto nel weekend."},
  saltafila:null, coda:{tipica:0, punta:15},
  fatica:{km:0, gradini:0, ombra:"nessuna"},
  quando:"qualsiasi",
  perche:"Il piatto simbolo della cucina fiorentina, da provare almeno una volta.",
  visita:[],
  tips:["Si ordina a peso e si condivide: chiedi al cameriere la taglia giusta per due."],
  wc:"Interno", verificato:"2026-08-08", daVerificare:false
}
];
