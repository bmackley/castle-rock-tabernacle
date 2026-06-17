-- Add checked_in column to reservations for the volunteer check-in tool.
-- Run once in the Supabase SQL editor.

alter table public.reservations
  add column if not exists checked_in boolean not null default false;

create index if not exists reservations_checked_in_idx
  on public.reservations (checked_in);
