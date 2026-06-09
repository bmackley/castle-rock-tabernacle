import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTourReminder } from "@/lib/email/resend";
import { isAuthorizedCron } from "@/lib/cron";

interface Row {
  name: string;
  email: string;
  party_size: number;
  confirmation_code: string;
  tour_slots: { slot_date: string; start_time: string; end_time: string } | null;
}

// Daily: email everyone whose tour is tomorrow a friendly reminder.
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const target = tomorrow.toISOString().slice(0, 10);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("name, email, party_size, confirmation_code, tour_slots!inner(slot_date, start_time, end_time)")
    .eq("status", "confirmed")
    .eq("tour_slots.slot_date", target);

  if (error) {
    console.error("cron reminders", error);
    return NextResponse.json({ error: "Query failed." }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as Row[];
  let sent = 0;
  for (const r of rows) {
    if (!r.tour_slots) continue;
    await sendTourReminder({
      to: r.email,
      name: r.name,
      code: r.confirmation_code,
      slotDate: r.tour_slots.slot_date,
      startTime: r.tour_slots.start_time,
      endTime: r.tour_slots.end_time,
      partySize: r.party_size,
    });
    sent++;
  }

  return NextResponse.json({ date: target, reminders_sent: sent });
}
