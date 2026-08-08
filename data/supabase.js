/* Configurazione del progetto Supabase.

   Questi due valori sono PUBBLICI per progetto: la chiave "publishable" è
   pensata per stare dentro una pagina web. Non è un segreto — a proteggere i
   dati è la Row Level Security sul database, che lega ogni riga al tuo
   auth.uid(). La chiave segreta (service_role) non compare da nessuna parte
   in questo repo, e la chiave Gemini vive solo nei secrets del progetto.

   Per usare un altro progetto, cambia questi due valori. Per tornare all'app
   solo-locale, svuotali: l'app funziona lo stesso, con localStorage. */

window.SUPABASE_CFG = {
  url: 'https://ncvsthbfhfqrvfvjoybb.supabase.co',
  chiave: 'sb_publishable_GCoMruI8xcYLH7Zfs1O0cQ_LqC0nwov',
  funzione: 'assistente'
};
