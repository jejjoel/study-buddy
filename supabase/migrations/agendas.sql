-- =====================================================
-- AGENDAS (Halaman Jadwal & Sinkronisasi Diskusi)
-- Project: study-buddy-database
-- =====================================================

create table if not exists public.agendas (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  discussion_id bigint references public.discussions(id) on delete cascade,
  judul         text not null,
  kategori      text not null default 'Umum',
  tanggal       date not null,
  jam_mulai     time without time zone not null,
  jam_selesai   time without time zone not null,
  kode_room     text,
  catatan       text,
  created_at    timestamptz not null default now(),
  constraint agendas_jam_valid check (jam_selesai > jam_mulai)
);

create index if not exists agendas_user_tanggal_idx on public.agendas (user_id, tanggal, jam_mulai);
create index if not exists agendas_discussion_id_idx on public.agendas (discussion_id);
create unique index if not exists agendas_user_discussion_uidx
  on public.agendas (user_id, discussion_id)
  where discussion_id is not null;

alter table public.agendas enable row level security;

create policy "agendas_select_own"
  on public.agendas for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "agendas_insert_own"
  on public.agendas for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "agendas_update_own"
  on public.agendas for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "agendas_delete_own"
  on public.agendas for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Trigger otomatis sinkronisasi saat Join diskusi -> tabel agendas
create or replace function public.handle_discussion_join_agenda()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_disc public.discussions;
  v_auth_uid uuid := auth.uid();
begin
  if v_auth_uid is null then
    return new;
  end if;

  select * into v_disc
  from public.discussions
  where id = new.discussion_id;

  if found then
    insert into public.agendas (
      user_id,
      discussion_id,
      judul,
      kategori,
      tanggal,
      jam_mulai,
      jam_selesai,
      catatan
    )
    values (
      v_auth_uid,
      v_disc.id,
      v_disc.title,
      coalesce(nullif(btrim(v_disc.category), ''), nullif(btrim(v_disc.tag), ''), 'Diskusi'),
      (v_disc.starts_at at time zone 'Asia/Jakarta')::date,
      (v_disc.starts_at at time zone 'Asia/Jakarta')::time,
      (v_disc.ends_at at time zone 'Asia/Jakarta')::time,
      v_disc.description
    )
    on conflict (user_id, discussion_id) where discussion_id is not null
    do nothing;
  end if;

  return new;
end;
$$;

create or replace trigger on_discussion_participant_joined
  after insert on public.discussion_participants
  for each row execute function public.handle_discussion_join_agenda();

