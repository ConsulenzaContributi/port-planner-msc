-- Port Planner — dati di viaggio, uno spazio privato per ogni utente.
-- Applicato al progetto ncvsthbfhfqrvfvjoybb l'08/08/2026.
-- Tutto è chiuso da Row Level Security su auth.uid(): senza login non si legge
-- e non si scrive niente, e nessuno vede i piani di un altro.

create table public.piani (
  user_id    uuid    not null references auth.users on delete cascade,
  scalo_id   text    not null,
  ritmo      text    not null default 'medio',
  items      jsonb   not null default '[]'::jsonb,
  seme       bigint,
  updated_at timestamptz not null default now(),
  primary key (user_id, scalo_id)
);

create table public.poi_custom (
  user_id    uuid    not null references auth.users on delete cascade,
  poi_id     text    not null,
  dati       jsonb   not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, poi_id)
);

create table public.impostazioni (
  user_id     uuid primary key references auth.users on delete cascade,
  fuori_scope boolean not null default false,
  updated_at  timestamptz not null default now()
);

alter table public.piani        enable row level security;
alter table public.poi_custom   enable row level security;
alter table public.impostazioni enable row level security;

create policy "piani: leggo i miei"      on public.piani for select to authenticated using ((select auth.uid()) = user_id);
create policy "piani: inserisco i miei"  on public.piani for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "piani: aggiorno i miei"   on public.piani for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "piani: cancello i miei"   on public.piani for delete to authenticated using ((select auth.uid()) = user_id);

create policy "poi: leggo i miei"        on public.poi_custom for select to authenticated using ((select auth.uid()) = user_id);
create policy "poi: inserisco i miei"    on public.poi_custom for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "poi: aggiorno i miei"     on public.poi_custom for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "poi: cancello i miei"     on public.poi_custom for delete to authenticated using ((select auth.uid()) = user_id);

create policy "impostazioni: leggo"      on public.impostazioni for select to authenticated using ((select auth.uid()) = user_id);
create policy "impostazioni: inserisco"  on public.impostazioni for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "impostazioni: aggiorno"   on public.impostazioni for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function public.tocca_updated_at()
returns trigger language plpgsql security definer set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

create trigger t_piani        before update on public.piani        for each row execute function public.tocca_updated_at();
create trigger t_poi_custom   before update on public.poi_custom   for each row execute function public.tocca_updated_at();
create trigger t_impostazioni before update on public.impostazioni for each row execute function public.tocca_updated_at();

-- La funzione del trigger non va esposta come RPC: serve solo ai trigger.
revoke execute on function public.tocca_updated_at() from anon, authenticated, public;
