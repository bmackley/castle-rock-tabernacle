import type { Metadata } from "next";
import CheckInClient from "./CheckInClient";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Check-In", robots: { index: false } };
export const dynamic = "force-dynamic";

export interface SlotWithReservations {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  status: string;
  reservations: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    party_size: number;
    confirmation_code: string;
    checked_in: boolean;
    status: string;
  }[];
}

export default async function CheckInPage() {
  const supabase = createAdminClient();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Denver" });

  const [slotsRes, datesRes] = await Promise.all([
    supabase
      .from("tour_slots")
      .select(`
        id, slot_date, start_time, end_time, capacity, status,
        reservations(id, name, email, phone, party_size, confirmation_code, checked_in, status)
      `)
      .eq("slot_date", today)
      .eq("status", "open")
      .order("start_time", { ascending: true }),

    // Fetch all distinct tour dates so the client can render day tabs
    supabase
      .from("tour_slots")
      .select("slot_date")
      .eq("status", "open")
      .order("slot_date", { ascending: true }),
  ]);

  const slots = ((slotsRes.data ?? []) as unknown as SlotWithReservations[]).map((s) => ({
    ...s,
    reservations: s.reservations.filter((r) => r.status === "confirmed"),
  }));

  const allDates = Array.from(
    new Set((datesRes.data ?? []).map((r) => r.slot_date as string))
  ).sort();

  return (
    <CheckInClient
      initialSlots={slots}
      today={today}
      allDates={allDates}
      serverError={slotsRes.error !== null}
    />
  );
}
