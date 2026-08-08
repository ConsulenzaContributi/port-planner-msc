-- Tabelle di supporto alle feature premium. Ognuna è indipendente: se una
-- feature non viene attivata, la tabella resta semplicemente vuota/inutilizzata.
--
-- budget_voci e ritmo_storico usano viaggio_id/tappa_id TESTO (come piani in
-- 0001), coerenti con l'MVP a file statico: non sono FK verso viaggi/tappe.
-- viaggio_collaboratori invece ha bisogno per forza di una riga vera in
-- "viaggi" a cui appendere i permessi RLS: la collaborazione multiutente
-- (idea premium 5) è quindi l'unica di queste feature che resta un vero
-- placeholder finché "Nuovo viaggio" non scrive nel DB invece che in un file.

-- Idea premium 2 — budget tracker: voci di spesa extra non legate a una
-- singola attività del catalogo (alloggio, trasporti, assicurazione...).
create table public.budget_voci (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  viaggio_id  text not null,
  tappa_id    text,
  categoria   text not null default 'altro',
  descrizione text not null default '',
  importo     numeric not null default 0,
  data        date,
  created_at  timestamptz not null default now()
);

-- Idea premium 5 — collaborazione: altri utenti invitati su un viaggio, con
-- ruolo. Il proprietario resta viaggi.user_id. PLACEHOLDER finché il viaggio
-- non è una riga vera in "viaggi" (vedi nota sopra): oggi questa tabella non
-- ha nulla da referenziare per un viaggio caricato da file statico.
create table public.viaggio_collaboratori (
  viaggio_id  uuid not null references public.viaggi on delete cascade,
  user_id     uuid not null references auth.users on delete cascade,
  ruolo       text not null default 'editor',   -- 'editor' | 'lettore'
  invitato_da uuid not null references auth.users on delete cascade,
  creato_il   timestamptz not null default now(),
  primary key (viaggio_id, user_id)
);

-- Idea premium 9 — ritmo di viaggio personalizzato: storico delle scelte
-- (quante attività/giorno accettate, km percorsi) per calibrare i suggerimenti.
create table public.ritmo_storico (
  user_id       uuid not null references auth.users on delete cascade,
  viaggio_id    text not null,
  data          date not null,
  attivita_previste  int not null default 0,
  attivita_completate int not null default 0,
  km_piedi      numeric not null default 0,
  feedback      text,             -- 'troppo_pieno' | 'ok' | 'troppo_vuoto'
  primary key (user_id, viaggio_id, data)
);

alter table public.budget_voci          enable row level security;
alter table public.viaggio_collaboratori enable row level security;
alter table public.ritmo_storico        enable row level security;

create policy "budget: leggo le mie"     on public.budget_voci for select to authenticated using ((select auth.uid()) = user_id);
create policy "budget: inserisco le mie" on public.budget_voci for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "budget: aggiorno le mie"  on public.budget_voci for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "budget: cancello le mie"  on public.budget_voci for delete to authenticated using ((select auth.uid()) = user_id);

-- Collaboratori: il proprietario del viaggio e i collaboratori stessi possono
-- vedere la lista; solo il proprietario invita/rimuove.
create policy "collab: vedo se proprietario o membro" on public.viaggio_collaboratori for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (select 1 from public.viaggi v where v.id = viaggio_id and v.user_id = (select auth.uid()))
  );
create policy "collab: invita solo proprietario" on public.viaggio_collaboratori for insert to authenticated
  with check (exists (select 1 from public.viaggi v where v.id = viaggio_id and v.user_id = (select auth.uid())));
create policy "collab: rimuove solo proprietario" on public.viaggio_collaboratori for delete to authenticated
  using (exists (select 1 from public.viaggi v where v.id = viaggio_id and v.user_id = (select auth.uid())));

create policy "ritmo: leggo il mio"     on public.ritmo_storico for select to authenticated using ((select auth.uid()) = user_id);
create policy "ritmo: inserisco il mio" on public.ritmo_storico for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "ritmo: aggiorno il mio"  on public.ritmo_storico for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- NOTA: per estendere le policy di 'piani' e 'tappe' alla lettura/scrittura da
-- parte dei collaboratori (non solo del proprietario), aggiungere in una
-- migrazione successiva condizioni OR-exists su viaggio_collaboratori, una
-- volta che la UI di invito (idea premium 5) è testata end-to-end.
