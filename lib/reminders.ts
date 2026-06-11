import { createAdminClient } from "@/lib/supabase/admin";
import { sendTourReminder, sendTourMorningReminder } from "@/lib/email/resend";

// Two reminder touchpoints: the day before a tour, and the morning of.
export type ReminderWindow = "day_before" | "morning_of";

// Tour dates are stored as plain dates in venue-local time, so "today" and
// "tomorrow" must be computed in the venue's timezone — a cron firing in UTC
// evening is already "tomorrow" in UTC but still today in Castle Rock.
const VENUE_TZ = "America/Denver";

export function venueDate(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return d.toLocaleDateString("en-CA", { timeZone: VENUE_TZ }); // YYYY-MM-DD
}

interface Row {
  name: string;
  email: string;
  party_size: number;
  confirmation_code: string;
  tour_slots: { slot_date: string; start_time: string; end_time: string } | null;
}

export async function sendRemindersFor(window: ReminderWindow) {
  const target = window === "day_before" ? venueDate(1) : venueDate(0);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("name, email, party_size, confirmation_code, tour_slots!inner(slot_date, start_time, end_time)")
    .eq("status", "confirmed")
    .eq("tour_slots.slot_date", target);

  if (error) throw new Error(error.message);

  const send = window === "day_before" ? sendTourReminder : sendTourMorningReminder;
  const rows = (data ?? []) as unknown as Row[];
  let sent = 0;
  for (const r of rows) {
    if (!r.tour_slots) continue;
    try {
      await send({
        to: r.email,
        name: r.name,
        code: r.confirmation_code,
        slotDate: r.tour_slots.slot_date,
        startTime: r.tour_slots.start_time,
        endTime: r.tour_slots.end_time,
        partySize: r.party_size,
      });
      sent++;
    } catch (err) {
      // One bad address must not block the rest of the day's reminders.
      console.error(`reminder (${window}) to ${r.email}`, err);
    }
  }

  return { window, date: target, reminders_sent: sent };
}
