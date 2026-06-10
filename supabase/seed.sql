-- Seed: opening week June 21–28, 2026. 20-minute tour slots, capacity 20.
-- Weekdays (Mon–Sat): 9:30 AM – 4:30 PM start times.
-- Sundays (Jun 21, Jun 28): 1:30 PM – 4:30 PM start times.
-- Safe to run more than once (conflicts are ignored).

-- Weekday slots: Mon Jun 22 – Fri Jun 26 + Sat Jun 27
insert into public.tour_slots (slot_date, start_time, end_time, capacity)
select
  ts::date,
  ts::time,
  (ts + interval '20 minutes')::time,
  20
from generate_series(
  timestamp '2026-06-22 09:30',
  timestamp '2026-06-27 16:30',
  interval '20 minutes'
) as ts
where
  ts::time between time '09:30' and time '16:30'
  and extract(dow from ts) between 1 and 6
on conflict (slot_date, start_time) do nothing;

-- Sunday slots: Jun 21 and Jun 28 (start at 1:30 PM)
insert into public.tour_slots (slot_date, start_time, end_time, capacity)
select
  ts::date,
  ts::time,
  (ts + interval '20 minutes')::time,
  20
from generate_series(
  timestamp '2026-06-21 13:30',
  timestamp '2026-06-28 16:30',
  interval '20 minutes'
) as ts
where
  ts::time between time '13:30' and time '16:30'
  and extract(dow from ts) = 0
on conflict (slot_date, start_time) do nothing;

-- June 20 Kick-Off Devotional (informational event, no booking)
insert into public.events (title, event_date, start_time, location, description)
values (
  'Community Kick-Off Devotional',
  '2026-06-20',
  '00:00:00',
  '3301 Meadows Blvd, Castle Rock, CO 80109',
  'Join us for a community devotional to kick off the Ancient Tabernacle Tour week.'
)
on conflict do nothing;
