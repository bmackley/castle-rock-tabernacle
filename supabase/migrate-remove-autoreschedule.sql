-- Remove auto-reschedule from book_slot.
-- Guests can now hold multiple reservations. Run once in the Supabase SQL editor.

drop function if exists public.book_slot(uuid, text, text, text, int);

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
  if p_party_size is null or p_party_size < 1 or p_party_size > 20 then
    raise exception 'Please choose a party size between 1 and 20.' using errcode = 'check_violation';
  end if;
  if coalesce(btrim(p_name), '') = '' then
    raise exception 'Please enter your name.' using errcode = 'check_violation';
  end if;
  if p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Please enter a valid email address.' using errcode = 'check_violation';
  end if;

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

  loop
    v_code := 'CRT-' || upper(substr(md5(gen_random_uuid()::text), 1, 5));
    exit when not exists (select 1 from public.reservations where reservations.confirmation_code = v_code);
  end loop;

  insert into public.reservations (slot_id, name, email, phone, party_size, confirmation_code)
  values (p_slot_id, btrim(p_name), lower(btrim(p_email)), nullif(btrim(p_phone), ''), p_party_size, v_code);

  return query select v_code, v_slot.slot_date, v_slot.start_time, v_slot.end_time;
end;
$$;

grant execute on function public.book_slot(uuid, text, text, text, int) to anon, authenticated;
