import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { AvailableSlot } from "@/lib/types";

// Public: returns open, future tour slots that still have room (no PII).
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("available_slots")
    .select("*")
    .order("slot_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("availability GET", error);
    return NextResponse.json({ error: "Could not load availability." }, { status: 500 });
  }

  return NextResponse.json({ slots: (data ?? []) as AvailableSlot[] });
}
