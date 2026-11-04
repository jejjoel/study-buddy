-- =====================================================
-- STUDY ROOMS (Room Server, Peserta, Chat Room, Views & RPC)
-- Project: study-buddy-database
-- =====================================================

create table if not exists public.study_rooms (
  id             uuid primary key default gen_random_uuid(),
  kode           text not null unique check (kode ~ '^[0-9]{4}$'),
  nama           text not null check (char_length(btrim(nama)) between 1 and 60),
  kategori       text not null default 'Umum',
  kapasitas      integer not null default 10 check (kapasitas between 1 and 50),
  password_hash  text,
  host_id        uuid default auth.uid() references auth.users(id) on delete set null,
  permanent      boolean not null default false,
  is_archived    boolean not null default false,
  created_at     timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

create index if not exists study_rooms_host_id_idx on public.study_rooms (host_id);
create index if not exists study_rooms_created_at_idx on public.study_rooms (created_at desc);

create table if not exists public.study_room_participants (
  room_id   uuid not null references public.study_rooms(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  nama      text not null,
  joined_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  primary key (room_id, user_id)
);

create index if not exists study_room_participants_user_idx on public.study_room_participants (user_id);
create index if not exists study_room_participants_room_seen_idx on public.study_room_participants (room_id, last_seen);

create table if not exists public.study_room_messages (
  id         uuid primary key default gen_random_uuid(),
  room_id    uuid not null references public.study_rooms(id) on delete cascade,
  sender_id  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nama       text not null,
  isi        text not null check (char_length(btrim(isi)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists study_room_messages_room_created_idx on public.study_room_messages (room_id, created_at);
create index if not exists study_room_messages_sender_idx on public.study_room_messages (sender_id);

alter table public.study_rooms enable row level security;
alter table public.study_room_participants enable row level security;
alter table public.study_room_messages enable row level security;

create policy "study_rooms_select_authenticated"
  on public.study_rooms for select
  to authenticated
  using (true);

create policy "room_participants_select_all"
  on public.study_room_participants for select
  to authenticated
  using (true);

create policy "room_messages_select_members"
  on public.study_room_messages for select
  to authenticated
  using (
    exists (
      select 1
      from public.study_room_participants p
      where p.room_id = study_room_messages.room_id
        and p.user_id = (select auth.uid())
        and p.last_seen > (now() - interval '2 minutes')
    )
  );

create policy "room_messages_insert_members"
  on public.study_room_messages for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1
      from public.study_room_participants p
      where p.room_id = study_room_messages.room_id
        and p.user_id = (select auth.uid())
        and p.last_seen > (now() - interval '2 minutes')
    )
  );

-- Views
create or replace view public.study_rooms_list
with (security_invoker = true)
as
select
  r.id,
  r.kode,
  r.nama,
  r.kategori,
  r.kapasitas,
  r.host_id,
  r.created_at,
  (r.password_hash is not null) as has_password,
  (
    select count(*)::integer
    from public.study_room_participants p
    where p.room_id = r.id
      and p.last_seen > (now() - interval '1 minute')
  ) as peserta
from public.study_rooms r
where r.is_archived = false;

create or replace view public.study_room_active_participants
with (security_invoker = true)
as
select
  room_id,
  user_id,
  nama,
  joined_at
from public.study_room_participants
where last_seen > (now() - interval '1 minute');

grant select on public.study_rooms_list to authenticated;
grant select on public.study_room_active_participants to authenticated;

-- RPC Functions
create or replace function public.study_cleanup_rooms()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.study_room_participants
  where last_seen < now() - interval '5 minutes';
end;
$$;

create or replace function public.study_room_heartbeat(p_room_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.study_rooms
    where id = p_room_id and is_archived = false
  ) then
    return false;
  end if;

  update public.study_room_participants
  set last_seen = now()
  where room_id = p_room_id and user_id = auth.uid();

  if not found then
    return false;
  end if;

  update public.study_rooms
  set last_active_at = now()
  where id = p_room_id;

  return true;
end;
$$;

create or replace function public.study_leave_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.study_room_participants
  set last_seen = now() - interval '10 minutes'
  where room_id = p_room_id and user_id = auth.uid();
end;
$$;

create or replace function public.study_delete_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  update public.study_rooms
  set is_archived = true
  where id = p_room_id and host_id = auth.uid() and is_archived = false;

  if not found then
    raise exception 'BUKAN_HOST';
  end if;

  update public.study_room_participants
  set last_seen = now() - interval '10 minutes'
  where room_id = p_room_id;
end;
$$;

create or replace function public.study_create_room(
  p_nama text,
  p_kategori text,
  p_kapasitas integer,
  p_password text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_kode text;
  v_id uuid;
  v_try int := 0;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  if p_password is not null and p_password <> '' and p_password !~ '^[0-9]{1,12}$' then
    raise exception 'PASSWORD_INVALID';
  end if;

  loop
    v_try := v_try + 1;
    v_kode := (floor(random() * 9000) + 1000)::int::text;
    begin
      insert into public.study_rooms (kode, nama, kategori, kapasitas, password_hash, host_id)
      values (
        v_kode,
        btrim(p_nama),
        coalesce(nullif(btrim(p_kategori), ''), 'Umum'),
        least(50, greatest(1, coalesce(p_kapasitas, 10))),
        case
          when p_password is null or p_password = '' then null
          else crypt(p_password, gen_salt('bf'))
        end,
        auth.uid()
      )
      returning id into v_id;
      return v_id;
    exception when unique_violation then
      if v_try >= 30 then
        raise exception 'KODE_HABIS';
      end if;
    end;
  end loop;
end;
$$;

create or replace function public.study_join_room(
  p_room_id uuid,
  p_password text default null,
  p_nama text default null
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  r public.study_rooms;
  v_count int;
  v_nama text := coalesce(nullif(btrim(p_nama), ''), 'Pengguna');
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select * into r
  from public.study_rooms
  where id = p_room_id and is_archived = false;

  if not found then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if r.password_hash is not null and r.host_id is distinct from auth.uid() then
    if p_password is null or r.password_hash <> crypt(p_password, r.password_hash) then
      raise exception 'PASSWORD_SALAH';
    end if;
  end if;

  if not exists (
    select 1
    from public.study_room_participants
    where room_id = p_room_id
      and user_id = auth.uid()
      and last_seen > now() - interval '60 seconds'
  ) then
    select count(*) into v_count
    from public.study_room_participants
    where room_id = p_room_id
      and last_seen > now() - interval '60 seconds';

    if v_count >= r.kapasitas then
      raise exception 'ROOM_PENUH';
    end if;
  end if;

  update public.study_rooms set last_active_at = now() where id = p_room_id;

  insert into public.study_room_participants (room_id, user_id, nama, joined_at, last_seen)
  values (p_room_id, auth.uid(), v_nama, now(), now())
  on conflict (room_id, user_id) do update
  set nama = excluded.nama,
      joined_at = now(),
      last_seen = now();
end;
$$;

grant execute on function public.study_cleanup_rooms() to authenticated;
grant execute on function public.study_room_heartbeat(uuid) to authenticated;
grant execute on function public.study_leave_room(uuid) to authenticated;
grant execute on function public.study_delete_room(uuid) to authenticated;
grant execute on function public.study_create_room(text, text, integer, text) to authenticated;
grant execute on function public.study_join_room(uuid, text, text) to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.study_room_participants;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.study_room_messages;
exception
  when duplicate_object then null;
end $$;

