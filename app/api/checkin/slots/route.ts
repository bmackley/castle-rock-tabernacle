import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? "";
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tour_slots")
    .select(`
      id, slot_date, start_time, end_time, capacity, status,
      reservations(id, name, email, phone, party_size, confirmation_code, checked_in, status)
    `)
    .eq("slot_date", date)
    .eq("status", "open")
    .order("start_time", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const slots = ((data ?? []) as any[]).map((s) => ({
    ...s,
    reservations: s.reservations.filter((r: any) => r.status === "confirmed"),
  }));

  return NextResponse.json({ slots });
}
