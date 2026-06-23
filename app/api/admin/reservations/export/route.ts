import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface ExportRow {
  confirmation_code: string;
  name: string;
  party_size: number;
  checked_in: boolean;
  tour_slots: { slot_date: string; start_time: string } | null;
}

function csvCell(value: string | number | boolean | null): string {
  const s = value === null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// GET — download all confirmed reservations as a CSV.
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("confirmation_code, name, party_size, checked_in, tour_slots(slot_date, start_time)")
    .eq("status", "confirmed")
    .order("tour_slots(slot_date)", { ascending: true });

  if (error) {
    console.error("admin reservations export", error);
    return NextResponse.json({ error: "Could not export reservations." }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as ExportRow[];
  const header = ["Name", "Party Size", "Tour Date", "Tour Time", "Checked In"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.name,
        r.party_size,
        r.tour_slots?.slot_date ?? "",
        r.tour_slots?.start_time ?? "",
        r.checked_in ? "Yes" : "No",
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
