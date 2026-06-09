import Link from "next/link";
import { CalendarClock, Users, Ticket, ArrowRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateLong, formatTimeRange } from "@/lib/booking";

export const dynamic = "force-dynamic";

interface RecentRow {
  confirmation_code: string;
  name: string;
  party_size: number;
  created_at: string;
  tour_slots: { slot_date: string; start_time: string; end_time: string } | null;
}

export default async function AdminOverviewPage() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ count: upcomingSlots }, confirmed, recent] = await Promise.all([
    supabase
      .from("tour_slots")
      .select("id", { count: "exact", head: true })
      .gte("slot_date", today)
      .eq("status", "open"),
    supabase.from("reservations").select("party_size").eq("status", "confirmed"),
    supabase
      .from("reservations")
      .select("confirmation_code, name, party_size, created_at, tour_slots(slot_date, start_time, end_time)")
      .eq("status", "confirmed")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const reservationCount = confirmed.data?.length ?? 0;
  const guestCount = (confirmed.data ?? []).reduce((sum, r) => sum + (r.party_size ?? 0), 0);
  const recentRows = (recent.data ?? []) as unknown as RecentRow[];

  const stats = [
    { label: "Open upcoming slots", value: upcomingSlots ?? 0, icon: CalendarClock, href: "/admin/slots" },
    { label: "Confirmed reservations", value: reservationCount, icon: Ticket, href: "/admin/reservations" },
    { label: "Total guests booked", value: guestCount, icon: Users, href: "/admin/reservations" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-royal-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-600">Manage tour times and reservations.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-2xl border border-linen-200 bg-linen-50 p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <s.icon className="text-gold-700" size={22} />
              <ArrowRight className="text-slate-300 transition-colors group-hover:text-gold-700" size={18} />
            </div>
            <p className="mt-4 text-3xl font-semibold text-royal-900">{s.value}</p>
            <p className="mt-1 text-sm text-slate-600">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-linen-200 bg-linen-50">
        <div className="flex items-center justify-between border-b border-linen-200 px-6 py-4">
          <h2 className="font-semibold text-royal-900">Recent reservations</h2>
          <Link href="/admin/reservations" className="text-sm font-medium text-gold-700 hover:text-gold-700">View all →</Link>
        </div>
        {recentRows.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">No reservations yet.</p>
        ) : (
          <ul className="divide-y divide-linen-200">
            {recentRows.map((r) => (
              <li key={r.confirmation_code} className="flex items-center justify-between px-6 py-4 text-sm">
                <div>
                  <p className="font-medium text-royal-900">{r.name} <span className="text-slate-500">· {r.party_size} {r.party_size === 1 ? "guest" : "guests"}</span></p>
                  <p className="text-slate-500">
                    {r.tour_slots ? `${formatDateLong(r.tour_slots.slot_date)} · ${formatTimeRange(r.tour_slots.start_time, r.tour_slots.end_time)}` : "—"}
                  </p>
                </div>
                <span className="font-mono text-xs text-slate-500">{r.confirmation_code}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
