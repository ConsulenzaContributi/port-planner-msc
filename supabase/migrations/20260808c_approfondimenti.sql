-- Guide di approfondimento generate per una scheda. Applicato l'08/08/2026.
-- Non sono dati personali, sono conoscenza sul luogo: cache CONDIVISA (chi
-- genera per primo la guida di un posto la crea per entrambi i viaggiatori),
-- non per utente. Lettura pubblica (anche senza login), scrittura solo
-- autenticata per evitare abusi dell'API altrui.

create table public.approfondimenti (
  poi_id      text primary key,
  contenuto   jsonb not null,
  modello     text not null default '',
  creato_da   uuid references auth.users on delete set null,
  updated_at  timestamptz not null default now()
);

alter table public.approfondimenti enable row level security;

create policy "approfondimenti: lettura pubblica" on public.approfondimenti for select using (true);
create policy "approfondimenti: scrittura autenticata" on public.approfondimenti for insert to authenticated with check (true);
create policy "approfondimenti: aggiornamento autenticato" on public.approfondimenti for update to authenticated using (true) with check (true);

create trigger t_approfondimenti before update on public.approfondimenti for each row execute function public.tocca_updated_at();
