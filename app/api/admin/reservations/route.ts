import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// PATCH — cancel a reservation (frees the spot back into availability).
export async function PATCH(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
