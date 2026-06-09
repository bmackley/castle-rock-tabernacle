import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSlots, type GenerateSlotsInput } from "@/lib/booking";

// POST — bulk-generate slots from a recurring rule.
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let input: GenerateSlotsInput;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Basic validation
  if (!input.startDate || !input.endDate || !input.startTime || !input.endTime) {
    return NextResponse.json({ error: "Please complete the date and time range." }, { status: 400 });
  }
  if (input.endDate < input.startDate) {
    return NextResponse.json({ error: "End date must be on or after the start date." }, { status: 400 });
  }
  if (!Number.isInteger(input.intervalMinutes) || input.intervalMinutes < 5) {
    return NextResponse.json({ error: "Interval must be at least 5 minutes." }, { status: 400 });
  }
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes < 5) {
    return NextResponse.json({ error: "Tour length must be at least 5 minutes." }, { status: 400 });
  }
  if (!Number.isInteger(input.capacity) || input.capacity < 1) {
    return NextResponse.json({ error: "Capacity must be at least 1." }, { status: 400 });
  }

  const generated = generateSlots(input);
  if (generated.length === 0) {
    return NextResponse.json({ error: "That rule produced no tour times. Check your time window." }, { status: 400 });
  }
  if (generated.length > 2000) {
    return NextResponse.json({ error: "That would create over 2,000 slots. Please narrow the range." }, { status: 400 });
  }

  const rows = generated.map((s) => ({
    slot_date: s.slot_date,
    start_time: s.start_time,
    end_time: s.end_time,
    capacity: s.capacity,
    status: "open" as const,
  }));

  const supabase = createAdminClient();
  // ignoreDuplicates keeps existing slots (and their reservations) untouched.
  const { data, error } = await supabase
    .from("tour_slots")
    .upsert(rows, { onConflict: "slot_date,start_time", ignoreDuplicates: true })
    .select("id");

  if (error) {
    console.error("admin slots POST", error);
    return NextResponse.json({ error: "Could not create slots." }, { status: 500 });
  }

  const created = data?.length ?? 0;
  return NextResponse.json({
    created,
    requested: generated.length,
    skipped: generated.length - created,
  });
}

// PATCH — open/close a single slot.
export async function PATCH(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await request.json().catch(() => ({}));
  if (!id || (status !== "open" && status !== "closed")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("tour_slots").update({ status }).eq("id", id);
  if (error) {
    console.error("admin slots PATCH", error);
    return NextResponse.json({ error: "Could not update the slot." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

// DELETE — remove a slot (refused if it has active reservations).
export async function DELETE(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const supabase = createAdminClient();
  const { count } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("slot_id", id)
    .eq("status", "confirmed");

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "This slot has active reservations. Close it instead of deleting." },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("tour_slots").delete().eq("id", id);
  if (error) {
    console.error("admin slots DELETE", error);
    return NextResponse.json({ error: "Could not delete the slot." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
