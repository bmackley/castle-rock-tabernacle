import { createAdminClient } from "@/lib/supabase/admin";
import SlotGenerator from "@/components/admin/SlotGenerator";
import SlotsList, { type AdminSlot } from "@/components/admin/SlotsList";
import type { TourSlot } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminSlotsPage() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const [slotsRes, resvRes] = await Promise.all([
    supabase
      .from("tour_slots")
      .select("*")
      .gte("slot_date", today)
      .order("slot_date", { ascending: true })
      .order("start_time", { ascending: true }),
    supabase.from("reservations").select("slot_id, party_size").eq("status", "confirmed"),
  ]);

  const booked = new Map<string, number>();
  for (const r of resvRes.data ?? []) {
    booked.set(r.slot_id, (booked.get(r.slot_id) ?? 0) + (r.party_size ?? 0));
  }

  const slots: AdminSlot[] = ((slotsRes.data ?? []) as TourSlot[]).map((s) => ({
    id: s.id,
    slot_date: s.slot_date,
    start_time: s.start_time,
    end_time: s.end_time,
    capacity: s.capacity,
    status: s.status,
    booked: booked.get(s.id) ?? 0,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-royal-900">Tour Slots</h1>
        <p className="mt-1 text-sm text-slate-600">Create and manage the tour times visitors can reserve.</p>
      </div>

      <SlotGenerator />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-royal-900">Upcoming slots</h2>
        <SlotsList slots={slots} />
      </div>
    </div>
  );
}
