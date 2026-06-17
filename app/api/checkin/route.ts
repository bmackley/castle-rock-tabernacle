import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// PATCH — toggle checked_in on a reservation
export async function PATCH(request: NextRequest) {
  let body: { id?: string; checked_in?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.id || typeof body.checked_in !== "boolean") {
    return NextResponse.json({ error: "Missing id or checked_in." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("reservations")
    .update({ checked_in: body.checked_in })
    .eq("id", body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// POST — log a walk-in guest (creates a reservation on the given slot)
export async function POST(request: NextRequest) {
  let body: { slotId?: string; name?: string; partySize?: number; phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const slotId = body.slotId?.trim();
  const name = body.name?.trim();
  const partySize = Number(body.partySize ?? 1);

  if (!slotId || !name) {
    return NextResponse.json({ error: "Name and slot are required." }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Generate a unique code
  let code = "";
  for (let i = 0; i < 10; i++) {
    const candidate = "WI-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    const { data } = await supabase
      .from("reservations")
      .select("id")
      .eq("confirmation_code", candidate)
      .maybeSingle();
    if (!data) { code = candidate; break; }
  }
  if (!code) return NextResponse.json({ error: "Could not generate code." }, { status: 500 });

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      slot_id: slotId,
      name,
      email: "walkin@castlerocktabernacle.com",
      phone: body.phone?.trim() ?? null,
      party_size: partySize,
      confirmation_code: code,
      status: "confirmed",
      checked_in: true,
    })
    .select("id, confirmation_code")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, code: data.confirmation_code });
}

// GET — search reservations by name, email, or code
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("id, name, email, party_size, status, confirmation_code, checked_in, tour_slots(slot_date, start_time)")
    .or(`name.ilike.%${q}%,email.ilike.%${q}%,confirmation_code.ilike.%${q}%`)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ results: data ?? [] });
}
