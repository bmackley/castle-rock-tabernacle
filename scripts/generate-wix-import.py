#!/usr/bin/env python3
"""Generate supabase/migrate-wix.sql from Wix exports in ~/Downloads.

Inputs:
  - "Events (1).csv"  — full occurrence list; authoritative slot schedule.
  - "Ancient Tabernacle Tour Guest List*.csv" — per-occurrence guest exports
    (UTF-16, tab-separated). Wix does NOT put the slot time inside the file,
    so each file is pinned to its slot in MAPPING below. Totals per file were
    cross-checked against per-occurrence RSVP counts.

Rerun after adding new exports:  python3 scripts/generate-wix-import.py
Then run the SQL in the Supabase SQL editor (idempotent — safe to rerun).
"""

import csv
import sys
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

DOWNLOADS = Path.home() / "Downloads"
OUT = Path(__file__).resolve().parent.parent / "supabase" / "migrate-wix.sql"
DENVER = ZoneInfo("America/Denver")
UTC = ZoneInfo("UTC")

TOUR_TITLE = "Ancient Tabernacle Tour Experience"
SLOT_MINUTES = 20
CAPACITY = 15  # Wix closed registration at 15 guests per slot

# Guest-list file → (slot_date, start_time) in venue-local time.
# "verified" False = inferred from guest totals; confirm in Wix (open the
# occurrence, check the first guest matches the initials noted) and flip to
# True. Initials only here — this file lives in a public repo.
MAPPING = [
    # file, slot date, start, verified, first guest initials (for checking in Wix)
    ("Ancient Tabernacle Tour Guest List June 21 2026.csv",      "2026-06-21", "13:30", False, "S.A. +11 more, 15 guests"),
    ("Ancient Tabernacle Tour Guest List June 2026.csv",         "2026-06-21", "13:50", False, "B.R. +7 more, 15 guests"),
    ("Ancient Tabernacle Tour Guest List June 2026 (1).csv",     "2026-06-21", "14:10", False, "B.P. +7 more, 15 guests"),
    ("Ancient Tabernacle Tour Guest List, Jun 12 2026.csv",      "2026-06-21", "14:30", False, "A.F. +3 more, 15 guests"),
    ("Ancient Tabernacle Tour Guest List, Jun 12 2026 (1).csv",  "2026-06-21", "19:30", False, "M.B. x2, 15 guests"),
    ("Ancient Tabernacle Tour Guest List June 21 2026 (1).csv",  "2026-06-21", "14:50", True,  "M.A. +2, 11 guests — only 11-guest slot"),
    ("Ancient Tabernacle Tour Guest List June 21 2026 (2).csv",  "2026-06-21", "15:30", False, "R.G. + C.E., 12 guests"),
    ("Ancient Tabernacle Tour Guest List, Jun 21 2026 (2).csv",  "2026-06-21", "19:10", False, "a.b. + J.H., 12 guests"),
    ("Ancient Tabernacle Tour Guest List, Jun 21 2026 (1).csv",  "2026-06-21", "16:30", False, "A.M., 4 guests — could be 16:30 or 17:50"),
    # Duplicate of "...June 21 2026.csv" (same guests) — intentionally skipped:
    #   "Ancient Tabernacle Tour Guest List, Jun 21 2026.csv"
]

# Easier path for new exports: in Wix, open an occurrence, note its date and
# time, export the guest list, and immediately rename the download to
#   GL 2026-06-22 0930.csv
# (date + 24h start time). Files matching that pattern are picked up
# automatically as verified — no MAPPING entry needed.
AUTO_PATTERN = r"^GL (\d{4}-\d{2}-\d{2}) (\d{2})(\d{2})\.csv$"


def esc(s: str) -> str:
    return s.replace("'", "''").strip()


def read_events(path: Path):
    raw = path.open("rb").read(2)
    enc = "utf-16" if raw in (b"\xff\xfe", b"\xfe\xff") else "utf-8-sig"
    delim = "\t" if enc == "utf-16" else ","
    return list(csv.DictReader(path.open(encoding=enc), delimiter=delim))


def read_guests(path: Path):
    return list(csv.DictReader(path.open(encoding="utf-16"), delimiter="\t"))


def main():
    # ── Slots: every tour occurrence from the events export, in local time ──
    slots = {}
    for row in read_events(DOWNLOADS / "Events (1).csv"):
        if row["title"] != TOUR_TITLE:
            continue
        start_utc = datetime.fromisoformat(row["start date"].replace("Z", "+00:00"))
        local = start_utc.astimezone(DENVER)
        end = local + timedelta(minutes=SLOT_MINUTES)
        slots[(local.date().isoformat(), local.strftime("%H:%M"))] = end.strftime("%H:%M")
    print(f"slots from Wix schedule: {len(slots)}")

    # ── Reservations from the mapped guest files ──
    import re
    mapping = list(MAPPING)
    for path in sorted(DOWNLOADS.glob("GL *.csv")):
        m = re.match(AUTO_PATTERN, path.name)
        if m:
            mapping.append((path.name, m.group(1), f"{m.group(2)}:{m.group(3)}", True, "auto-mapped from filename"))

    reservations = []
    for fname, slot_date, start, verified, note in mapping:
        path = DOWNLOADS / fname
        if not path.exists():
            print(f"  !! missing file, skipped: {fname}", file=sys.stderr)
            continue
        if (slot_date, start) not in slots:
            print(f"  !! {fname}: slot {slot_date} {start} not in Wix schedule", file=sys.stderr)
            continue
        for g in read_guests(path):
            name = f"{g['First name'].strip()} {g['Last name'].strip()}".strip()
            party = int(g["Total guests"] or 1)
            reservations.append(
                dict(slot_date=slot_date, start=start, name=name,
                     email=g["Email"].strip().lower(), party=party,
                     rsvp_at=g["Timestamp"].strip(), file=fname, verified=verified, note=note)
            )
    total_guests = sum(r["party"] for r in reservations)
    print(f"reservations: {len(reservations)} rows, {total_guests} guests")

    # ── Emit SQL ──
    lines = [
        "-- Generated by scripts/generate-wix-import.py — do not edit by hand.",
        f"-- {len(slots)} tour slots (authoritative Wix schedule, capacity {CAPACITY}),",
        f"-- {len(reservations)} reservations / {total_guests} guests from exported guest lists.",
        "-- Idempotent: slots upsert on (slot_date, start_time); reservations skip",
        "-- rows already imported (matched on slot + email + name + RSVP timestamp).",
        "",
        "-- ── 1. Tour slots ──",
        "insert into public.tour_slots (slot_date, start_time, end_time, capacity) values",
    ]
    slot_rows = [
        f"  ('{d}', '{t}', '{end}', {CAPACITY})"
        for (d, t), end in sorted(slots.items())
    ]
    lines.append(",\n".join(slot_rows))
    lines.append(
        "on conflict (slot_date, start_time) do update\n"
        "  set end_time = excluded.end_time, capacity = excluded.capacity;"
    )
    lines.append("""
-- Optional cleanup: remove previously seeded slots that are NOT on the real
-- Wix schedule and have no reservations. Review before uncommenting.
-- delete from public.tour_slots s
--  where not exists (select 1 from public.reservations r
--                     where r.slot_id = s.id and r.status = 'confirmed')
--    and (s.slot_date, s.start_time) not in
--        (select slot_date, start_time from public.tour_slots
--          where false); -- replace with the generated slot list if desired

-- ── 2. Reservations ──""")

    current_file = None
    values = []
    for r in reservations:
        if r["file"] != current_file:
            current_file = r["file"]
            flag = "verified" if r["verified"] else "TODO verify slot in Wix"
            values.append(f"  -- {current_file} → {r['slot_date']} {r['start']} ({flag}: {r['note']})")
        values.append(
            f"  ('{r['slot_date']}', '{r['start']}', '{esc(r['name'])}', "
            f"'{esc(r['email'])}', {r['party']}, '{r['rsvp_at']}')"
        )
    lines.append("""do $$
declare
  rec record;
  v_slot_id uuid;
  v_code text;
  v_inserted int := 0;
begin
  for rec in
    select * from (values""")
    # strip trailing commas correctly: comment lines have no comma
    data_lines = []
    for v in values:
        data_lines.append(v if v.lstrip().startswith("--") else v + ",")
    # remove last comma
    for i in range(len(data_lines) - 1, -1, -1):
        if not data_lines[i].lstrip().startswith("--"):
            data_lines[i] = data_lines[i].rstrip(",")
            break
    lines.extend(data_lines)
    lines.append("""    ) as t(slot_date, start_time, guest_name, guest_email, party, rsvp_at)
  loop
    select id into v_slot_id
      from public.tour_slots
     where slot_date = rec.slot_date::date and start_time = rec.start_time::time;
    if v_slot_id is null then
      raise exception 'No slot for % %', rec.slot_date, rec.start_time;
    end if;

    -- Skip rows already imported (rerun-safe)
    if exists (
      select 1 from public.reservations
       where slot_id = v_slot_id
         and lower(email) = rec.guest_email
         and name = rec.guest_name
         and created_at = rec.rsvp_at::timestamptz
    ) then continue; end if;

    loop
      v_code := 'CRT-' || upper(substr(md5(gen_random_uuid()::text), 1, 5));
      exit when not exists (select 1 from public.reservations where confirmation_code = v_code);
    end loop;

    insert into public.reservations
      (slot_id, name, email, party_size, status, confirmation_code, created_at)
    values
      (v_slot_id, rec.guest_name, rec.guest_email, rec.party, 'confirmed', v_code, rec.rsvp_at::timestamptz);
    v_inserted := v_inserted + 1;
  end loop;
  raise notice 'Imported % new reservations', v_inserted;
end $$;""")

    OUT.write_text("\n".join(lines) + "\n")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
