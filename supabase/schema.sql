-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Castle Rock Tabernacle — database schema                            ║
-- ║  Run this once in the Supabase SQL editor on a fresh project.        ║
-- ╚══════════════════════════════════════════════════════════════════════╝
--
-- Design goals:
--   • Visitors book free tour spots; never overbook a time slot.
--   • The public (anon) role can ONLY read aggregated availability and call
--     book_slot / cancel_reservation. It can never read reservation PII.
--   • Admin uses the service-role key (bypasses RLS) for full management.

-- ── Shared updated_at trigger ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── tour_slots ────────────────────────────────────────────────────────
-- One bookable tour time. Capacity is the number of guests it can hold.
create table if not exists public.tour_slots (
  id          uuid primary key default gen_random_uuid(),
  slot_date   date        not null,
  start_time  time        not null,
  end_time    time        not null,
  capacity    int         not null default 20 check (capacity > 0),
  notes       text,
  status      text        not null default 'open' check (status in ('open', 'closed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (slot_date, start_time)
);

create index if not exists tour_slots_date_status_idx
  on public.tour_slots (slot_date, status);

drop trigger if exists set_tour_slots_updated_at on public.tour_slots;
create trigger set_tour_slots_updated_at
  before update on public.tour_slots
  for each row execute function public.set_updated_at();

-- ── reservations ──────────────────────────────────────────────────────
create table if not exists public.reservations (
  id                uuid primary key default gen_random_uuid(),
  slot_id           uuid        not null references public.tour_slots(id) on delete cascade,
  name              text        not null,
  email             text        not null,
  phone             text,
  party_size        int         not null default 1 check (party_size between 1 and 20),
  status            text        not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  confirmation_code text        not null unique,
  checked_in        boolean     not null default false,
  created_at        timestamptz not null default now()
);

create index if not exists reservations_slot_status_idx
  on public.reservations (slot_id, status);
create index if not exists reservations_email_idx
  on public.reservations (lower(email));

-- ── Public availability view ──────────────────────────────────────────
-- Exposes ONLY aggregated, non-PII data: which open future slots still have
-- room, and how many spots remain. Owned by postgres so it can read the
-- underlying RLS-protected tables; anon is granted SELECT on the view only.
create or replace view public.available_slots as
  select
    s.id,
    s.slot_date,
    s.start_time,
    s.end_time,
    s.capacity,
    s.notes,
    s.capacity - coalesce(sum(r.party_size) filter (where r.status = 'confirmed'), 0) as remaining
  from public.tour_slots s
  left join public.reservations r on r.slot_id = s.id
  where s.status = 'open'
    and s.slot_date >= current_date
  group by s.id
  having s.capacity - coalesce(sum(r.party_size) filter (where r.status = 'confirmed'), 0) > 0;

-- ── book_slot RPC ─────────────────────────────────────────────────────
-- The overbooking-safe core. Locks the slot row, recomputes remaining
-- capacity, and inserts the reservation atomically. Two simultaneous
-- requests for the last seat cannot both succeed.
create or replace function public.book_slot(
  p_slot_id    uuid,
  p_name       text,
  p_email      text,
  p_phone      text,
  p_party_size int
)
returns table (
  confirmation_code text,
  slot_date         date,
  start_time        time,
  end_time          time
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot   public.tour_slots%rowtype;
  v_booked int;
  v_code   text;
begin
  -- Input validation
  if p_party_size is null or p_party_size < 1 or p_party_size > 20 then
    raise exception 'Please choose a party size between 1 and 20.' using errcode = 'check_violation';
  end if;
  if coalesce(btrim(p_name), '') = '' then
    raise exception 'Please enter your name.' using errcode = 'check_violation';
  end if;
  if p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Please enter a valid email address.' using errcode = 'check_violation';
  end if;

  -- Lock this slot so concurrent bookings serialize on it
  select * into v_slot from public.tour_slots where id = p_slot_id for update;
  if not found then
    raise exception 'That tour time could not be found.' using errcode = 'no_data_found';
  end if;
  if v_slot.status <> 'open' then
    raise exception 'That tour time is no longer available.' using errcode = 'raise_exception';
  end if;
  if v_slot.slot_date < current_date then
    raise exception 'That tour time has already passed.' using errcode = 'raise_exception';
  end if;

  select coalesce(sum(party_size), 0) into v_booked
    from public.reservations
   where slot_id = p_slot_id and status = 'confirmed';

  if v_booked + p_party_size > v_slot.capacity then
    raise exception 'Only % spot(s) remain for that tour time.', (v_slot.capacity - v_booked)
      using errcode = 'raise_exception';
  end if;

  -- Unique, human-friendly confirmation code, e.g. CRT-8FK2A
  loop
    v_code := 'CRT-' || upper(substr(md5(gen_random_uuid()::text), 1, 5));
    exit when not exists (select 1 from public.reservations where reservations.confirmation_code = v_code);
  end loop;

  insert into public.reservations (slot_id, name, email, phone, party_size, confirmation_code)
  values (p_slot_id, btrim(p_name), lower(btrim(p_email)), nullif(btrim(p_phone), ''), p_party_size, v_code);

  return query select v_code, v_slot.slot_date, v_slot.start_time, v_slot.end_time;
end;
$$;

-- ── cancel_reservation RPC ────────────────────────────────────────────
-- Lets a guest cancel using their confirmation code + email. Frees capacity.
create or replace function public.cancel_reservation(
  p_code  text,
  p_email text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id
    from public.reservations
   where confirmation_code = upper(btrim(p_code))
     and lower(email) = lower(btrim(p_email))
     and status = 'confirmed';

  if not found then
    return false;
  end if;

  update public.reservations set status = 'cancelled' where id = v_id;
  return true;
end;
$$;

-- ── events ────────────────────────────────────────────────────────────
-- Informational/RSVP events (e.g. devotionals) that are not bookable tour slots.
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  event_date  date        not null,
  start_time  time        not null,
  end_time    time,
  location    text,
  description text,
  rsvp_url    text,
  status      text        not null default 'active' check (status in ('active', 'cancelled')),
  created_at  timestamptz not null default now(),
  unique (title, event_date, start_time)
);

create index if not exists events_date_idx on public.events (event_date);

grant select on public.events to anon, authenticated;

-- ── Row Level Security ────────────────────────────────────────────────
-- Enable RLS with NO anon/authenticated policies: direct table access is
-- denied. All public access flows through the view + SECURITY DEFINER RPCs.
-- The service-role key (admin) bypasses RLS entirely.
alter table public.tour_slots   enable row level security;
alter table public.reservations enable row level security;

-- ── Grants ────────────────────────────────────────────────────────────
revoke all on public.tour_slots   from anon, authenticated;
revoke all on public.reservations from anon, authenticated;

grant select on public.available_slots to anon, authenticated;
grant execute on function public.book_slot(uuid, text, text, text, int) to anon, authenticated;
grant execute on function public.cancel_reservation(text, text)          to anon, authenticated;
