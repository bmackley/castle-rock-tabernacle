import { createAdminClient } from "@/lib/supabase/admin";
import ReservationsTable, { type AdminReservation } from "@/components/admin/ReservationsTable";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  confirmation_code: string;
  name: string;
  email: string;
  phone: string | null;
  party_size: number;
  status: "confirmed" | "cancelled";
  created_at: string;
  tour_slots: { slot_date: string; start_time: string; end_time: string } | null;
}

export default async function AdminReservationsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("reservations")
    .select("id, confirmation_code, name, email, phone, party_size, status, created_at, tour_slots(slot_date, start_time, end_time)")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as Row[];
  const reservations: AdminReservation[] = rows.map((r) => ({
    id: r.id,
    confirmation_code: r.confirmation_code,
    name: r.name,
    email: r.email,
    phone: r.phone,
    party_size: r.party_size,
    status: r.status,
    created_at: r.created_at,
    slot_date: r.tour_slots?.slot_date ?? null,
    start_time: r.tour_slots?.start_time ?? null,
    end_time: r.tour_slots?.end_time ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-royal-900">Reservations</h1>
        <p className="mt-1 text-sm text-slate-600">Everyone who has reserved a tour. Search, filter, cancel, or export.</p>
      </div>
      <ReservationsTable reservations={reservations} />
    </div>
  );
}
