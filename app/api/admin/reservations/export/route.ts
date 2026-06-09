import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

interface ExportRow {
  confirmation_code: string;
  name: string;
  email: string;
  phone: string | null;
  party_size: number;
  status: string;
  created_at: string;
  tour_slots: { slot_date: string; start_time: string; end_time: string } | null;
}

function csvCell(value: string | number | null): string {
  const s = value === null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// GET — download all reservations as a CSV.
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("confirmation_code, name, email, phone, party_size, status, created_at, tour_slots(slot_date, start_time, end_time)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("admin reservations export", error);
    return NextResponse.json({ error: "Could not export reservations." }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as ExportRow[];
  const header = [
    "Confirmation",
    "Tour Date",
    "Start",
    "End",
    "Name",
    "Email",
    "Phone",
    "Party Size",
    "Status",
    "Booked At",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.confirmation_code,
        r.tour_slots?.slot_date ?? "",
        r.tour_slots?.start_time ?? "",
        r.tour_slots?.end_time ?? "",
        r.name,
        r.email,
        r.phone,
        r.party_size,
        r.status,
        r.created_at,
      ]
        .map(csvCell)
        .join(",")
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reservations.csv"`,
    },
  });
}
