-- Travel Planner — schema base. Progetto Supabase separato da Port Planner
-- (crociera): stesso principio di sicurezza (RLS su auth.uid()), ma qui un
-- utente può avere PIÙ viaggi, ciascuno con più tappe multi-giorno.
--
-- NOTA sull'MVP attuale: come CRUISE nel progetto crociera, il viaggio che il
-- client carica (window.VIAGGIO) è oggi un file JS statico con id stringa
-- (es. "roma", "firenze"), non ancora righe delle tabelle viaggi/tappe qui
-- sotto. "piani" e "attivita_custom" sincronizzano quindi per tappa_id TESTO
-- (uguale all'id nel file dati), scoped per utente — esattamente come
-- scalo_id in Port Planner. Le tabelle viaggi/tappe sono già pronte per
-- quando il "Nuovo viaggio" diventerà un form che scrive nel DB invece che un
-- file statico da editare a mano: a quel punto piani.tappa_id potrà diventare
-- una vera FK. Finché non succede, NON referenziano tappe.id.

create table public.viaggi (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users on delete cascade,
  nome                   text not null,
  viaggiatori             int not null default 1,
  valuta                 text not null default 'EUR',
  budget_persona_giorno  numeric not null default 0,
  data_partenza          date not null,
  data_arrivo            date not null,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table public.tappe (
  id            uuid primary key default gen_random_uuid(),
  viaggio_id    uuid not null references public.viaggi on delete cascade,
  ordine        int not null default 0,
  citta         text not null,
  paese         text,
  data_inizio   date not null,
  data_fine     date not null,
  alloggio_nome text,
  alloggio_lat  double precision,
  alloggio_lng  double precision,
  check_in      text,
  check_out     text,
  note          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Un piano per GIORNO dentro una tappa (non uno per tappa: le tappe durano
-- più giorni). Chiave naturale: utente + tappa + data del giorno.
-- tappa_id è TESTO (id della tappa nel file dati del viaggio), non FK: vedi
-- la nota in cima al file.
create table public.piani (
  user_id    uuid not null references auth.users on delete cascade,
  tappa_id   text not null,
  data       date not null,
  ritmo      text not null default 'medio',
  items      jsonb not null default '[]'::jsonb,
  seme       bigint,
  updated_at timestamptz not null default now(),
  primary key (user_id, tappa_id, data)
);

create table public.attivita_custom (
  user_id    uuid not null references auth.users on delete cascade,
  attivita_id text not null,
  dati       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, attivita_id)
);

create table public.impostazioni (
  user_id     uuid primary key references auth.users on delete cascade,
  fuori_scope boolean not null default false,
  raggio_km_default numeric not null default 3,
  updated_at  timestamptz not null default now()
);

alter table public.viaggi          enable row level security;
alter table public.tappe           enable row level security;
alter table public.piani           enable row level security;
alter table public.attivita_custom enable row level security;
alter table public.impostazioni    enable row level security;

create policy "viaggi: leggo i miei"     on public.viaggi for select to authenticated using ((select auth.uid()) = user_id);
create policy "viaggi: inserisco i miei" on public.viaggi for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "viaggi: aggiorno i miei"  on public.viaggi for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "viaggi: cancello i miei"  on public.viaggi for delete to authenticated using ((select auth.uid()) = user_id);

-- Le tappe ereditano il permesso dal viaggio: niente user_id diretto, si passa
-- da un EXISTS sul viaggio genitore.
create policy "tappe: leggo le mie"     on public.tappe for select to authenticated
  using (exists (select 1 from public.viaggi v where v.id = viaggio_id and v.user_id = (select auth.uid())));
create policy "tappe: inserisco le mie" on public.tappe for insert to authenticated
  with check (exists (select 1 from public.viaggi v where v.id = viaggio_id and v.user_id = (select auth.uid())));
create policy "tappe: aggiorno le mie"  on public.tappe for update to authenticated
  using (exists (select 1 from public.viaggi v where v.id = viaggio_id and v.user_id = (select auth.uid())))
  with check (exists (select 1 from public.viaggi v where v.id = viaggio_id and v.user_id = (select auth.uid())));
create policy "tappe: cancello le mie"  on public.tappe for delete to authenticated
  using (exists (select 1 from public.viaggi v where v.id = viaggio_id and v.user_id = (select auth.uid())));

create policy "piani: leggo i miei"      on public.piani for select to authenticated using ((select auth.uid()) = user_id);
create policy "piani: inserisco i miei"  on public.piani for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "piani: aggiorno i miei"   on public.piani for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "piani: cancello i miei"   on public.piani for delete to authenticated using ((select auth.uid()) = user_id);

create policy "attivita: leggo le mie"       on public.attivita_custom for select to authenticated using ((select auth.uid()) = user_id);
create policy "attivita: inserisco le mie"   on public.attivita_custom for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "attivita: aggiorno le mie"    on public.attivita_custom for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "attivita: cancello le mie"    on public.attivita_custom for delete to authenticated using ((select auth.uid()) = user_id);

create policy "impostazioni: leggo"      on public.impostazioni for select to authenticated using ((select auth.uid()) = user_id);
create policy "impostazioni: inserisco"  on public.impostazioni for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "impostazioni: aggiorno"   on public.impostazioni for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function public.tocca_updated_at()
returns trigger language plpgsql security definer set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

create trigger t_viaggi          before update on public.viaggi          for each row execute function public.tocca_updated_at();
create trigger t_tappe           before update on public.tappe           for each row execute function public.tocca_updated_at();
create trigger t_piani           before update on public.piani           for each row execute function public.tocca_updated_at();
create trigger t_attivita_custom before update on public.attivita_custom for each row execute function public.tocca_updated_at();
create trigger t_impostazioni    before update on public.impostazioni    for each row execute function public.tocca_updated_at();

revoke execute on function public.tocca_updated_at() from anon, authenticated, public;
