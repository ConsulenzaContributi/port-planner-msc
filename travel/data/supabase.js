/* Configurazione del progetto Supabase per Travel Planner.

   Progetto separato da quello di Port Planner (crociera): stesso pattern,
   stessa impostazione di sicurezza (RLS su auth.uid()), dati indipendenti.

   Progetto "Travel" (tevaelqvvxihauykjbkr) collegato l'08/08/2026: migrazioni
   applicate, Edge Function "assistente" distribuita, GEMINI_API_KEY nei
   secrets. Per usare un altro progetto, sostituisci i due valori sotto.

   Senza configurazione l'app funziona comunque in locale (localStorage),
   solo senza sincronizzazione cloud, agente AI e ricerca Gmail. */

window.SUPABASE_CFG = {
  url: 'https://tevaelqvvxihauykjbkr.supabase.co',
  chiave: 'sb_publishable_Kd5WqFRd5HgNRQV5jErA2w_sYv4NJcm',
  funzione: 'assistente'
};
