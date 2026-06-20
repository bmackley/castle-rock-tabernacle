import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// PATCH — cancel or restore a reservation.
export async function PATCH(request: NextRequest) {
  const { id, status } = await request.json().catch(() => ({}));
  if (!id || (status !== "confirmed" && status !== "cancelled")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
  if (error) {
    console.error("admin reservations PATCH", error);
    return NextResponse.json({ error: "Could not update the reservation." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

// PUT — move a reservation to a different slot.
export async function PUT(request: NextRequest) {
  const { id, slot_id } = await request.json().catch(() => ({}));
  if (!id || !slot_id) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: slot, error: slotErr } = await supabase
    .from("tour_slots")
    .select("id, capacity, status")
    .eq("id", slot_id)
    .single();
  if (slotErr || !slot) return NextResponse.json({ error: "Slot not found." }, { status: 404 });
  if (slot.status !== "open") return NextResponse.json({ error: "That slot is closed." }, { status: 409 });

  const { data: reservation } = await supabase
    .from("reservations")
    .select("party_size")
    .eq("id", id)
    .single();
  const partySize = reservation?.party_size ?? 1;

  const { data: booked } = await supabase
    .from("reservations")
    .select("party_size")
    .eq("slot_id", slot_id)
    .eq("status", "confirmed");
  const bookedGuests = (booked ?? []).reduce((n: number, r: { party_size: number }) => n + r.party_size, 0);
  if (bookedGuests + partySize > slot.capacity) {
    return NextResponse.json({ error: "Not enough capacity on that slot." }, { status: 409 });
  }

  const { error } = await supabase.from("reservations").update({ slot_id }).eq("id", id);
  if (error) {
    console.error("admin reservations PUT", error);
    return NextResponse.json({ error: "Could not move the reservation." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

// GET — list all open slots for the reassignment dropdown.
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tour_slots")
    .select("id, slot_date, start_time, capacity")
    .eq("status", "open")
    .order("slot_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ slots: data ?? [] });
}
