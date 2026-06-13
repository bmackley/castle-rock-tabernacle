-- Migration: book_slot v2 — automatic reschedule on re-booking.
-- Run once in the Supabase SQL editor. (schema.sql carries the same
-- definition for fresh installs.)
--
-- The return signature changes, so the old function must be dropped first;
-- dropping also removes grants, which are restored at the bottom.

drop function if exists public.book_slot(uuid, text, text, text, int);

create or replace function public.book_slot(
  p_slot_id    uuid,
  p_name       text,
  p_email      text,
  p_phone      text,
  p_party_size int
)
returns table (
  confirmation_code     text,
  slot_date             date,
  start_time            time,
  end_time              time,
  rescheduled_from_date date,
  rescheduled_from_start time,
  rescheduled_count     int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot       public.tour_slots%rowtype;
  v_booked     int;
  v_code       text;
  v_from_date  date;
  v_from_start time;
  v_cancelled  int := 0;
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

  -- Serialize bookings per email so two simultaneous requests can't each
  -- miss the other's reservation (the slot lock alone doesn't cover
  -- bookings landing on different slots).
  perform pg_advisory_xact_lock(hashtext(lower(btrim(p_email))));

  -- Auto-reschedule: cancel any upcoming confirmed reservations this guest
  -- already holds, remembering the most recent one for the notification.
  select s.slot_date, s.start_time into v_from_date, v_from_start
    from public.reservations r
    join public.tour_slots s on s.id = r.slot_id
   where lower(r.email) = lower(btrim(p_email))
     and r.status = 'confirmed'
     and s.slot_date >= current_date
   order by r.created_at desc
   limit 1;

  if found then
    update public.reservations r
       set status = 'cancelled'
      from public.tour_slots s
     where s.id = r.slot_id
       and lower(r.email) = lower(btrim(p_email))
       and r.status = 'confirmed'
       and s.slot_date >= current_date;
    get diagnostics v_cancelled = row_count;
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

  return query select v_code, v_slot.slot_date, v_slot.start_time, v_slot.end_time,
                      v_from_date, v_from_start, v_cancelled;
end;
$$;

grant execute on function public.book_slot(uuid, text, text, text, int) to anon, authenticated;
