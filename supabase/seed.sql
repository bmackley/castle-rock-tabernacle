-- Optional seed: mirrors the live site's opening week (June 21–28, 2026).
-- Creates 30-minute tour slots from 9:00 AM to 4:30 PM each day, 45 min long,
-- capacity 20. Safe to run more than once (existing slots are kept).
-- You can also create these from the admin UI → Tour Slots → Generate.

insert into public.tour_slots (slot_date, start_time, end_time, capacity)
select
  ts::date,
  ts::time,
  (ts + interval '45 minutes')::time,
  20
from generate_series(
  timestamp '2026-06-21 09:00',
  timestamp '2026-06-28 16:30',
  interval '30 minutes'
) as ts
where ts::time between time '09:00' and time '16:30'
on conflict (slot_date, start_time) do nothing;
