-- Email di conferma collegate a un'attività (stesso pattern del progetto
-- crociera). L'utente cerca nella propria Gmail con il token OAuth della
-- sessione (mai salvato qui): qui restano solo i puntatori.

create table public.email_collegate (
  user_id     uuid not null references auth.users on delete cascade,
  attivita_id text not null,
  message_id  text not null,
  thread_id   text not null,
  oggetto     text not null default '',
  mittente    text not null default '',
  data_mail   text not null default '',
  updated_at  timestamptz not null default now(),
  primary key (user_id, attivita_id, message_id)
);

alter table public.email_collegate enable row level security;

create policy "email: leggo le mie"     on public.email_collegate for select to authenticated using ((select auth.uid()) = user_id);
create policy "email: inserisco le mie" on public.email_collegate for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "email: cancello le mie"  on public.email_collegate for delete to authenticated using ((select auth.uid()) = user_id);

create trigger t_email_collegate before update on public.email_collegate for each row execute function public.tocca_updated_at();
