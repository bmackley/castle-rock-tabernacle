import type React from "react";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateLong, formatTime, weekdayName } from "@/lib/booking";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Tour Metrics", robots: { index: false } };
export const dynamic = "force-dynamic";

interface SlotRow {
  slot_date: string;
  start_time: string;
  capacity: number;
  status: string;
  reservations: { party_size: number; status: string; checked_in: boolean }[];
}

interface DaySummary {
  date: string;
  slots: number;
  capacity: number;
  confirmed: number;
  guests: number;
  checkedIn: number;
}

export default async function MetricsPage() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("tour_slots")
    .select("slot_date, start_time, capacity, status, reservations(party_size, status, checked_in)")
    .order("slot_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16 text-center text-slate-600">
        Could not load metrics. Please try again.
      </div>
    );
  }

  const rows = (data ?? []) as unknown as SlotRow[];

  // Group by date
  const byDate = new Map<string, DaySummary>();
  for (const slot of rows) {
    const existing = byDate.get(slot.slot_date) ?? {
      date: slot.slot_date,
      slots: 0,
      capacity: 0,
      confirmed: 0,
      guests: 0,
      checkedIn: 0,
    };
    const confirmedRes = slot.reservations.filter((r) => r.status === "confirmed");
    existing.slots += 1;
    existing.capacity += slot.capacity;
    existing.confirmed += confirmedRes.length;
    existing.guests += confirmedRes.reduce((s, r) => s + r.party_size, 0);
    existing.checkedIn += slot.reservations.filter((r) => r.checked_in).length;
    byDate.set(slot.slot_date, existing);
  }

  const days = Array.from(byDate.values());
  const totalGuests = days.reduce((s, d) => s + d.guests, 0);
  const totalCapacity = days.reduce((s, d) => s + d.capacity, 0);
  const totalCheckedIn = days.reduce((s, d) => s + d.checkedIn, 0);

  // Slot-level detail for the expandable section
  const slotsByDate = new Map<string, typeof rows>();
  for (const slot of rows) {
    const existing = slotsByDate.get(slot.slot_date) ?? [];
    existing.push(slot);
    slotsByDate.set(slot.slot_date, existing);
  }

  return (
    <div className="min-h-screen bg-linen-100">
      <div className="mx-auto max-w-4xl px-5 py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-700">{site.name}</p>
          <h1 className="mt-2 text-3xl font-semibold text-royal-900">Tour Metrics</h1>
          <p className="mt-1 text-sm text-slate-500">{site.season}</p>
        </div>

        {/* Totals */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total guests reserved", value: totalGuests },
            { label: "Total checked in", value: totalCheckedIn },
            { label: "Overall capacity used", value: totalCapacity > 0 ? `${Math.round((totalGuests / totalCapacity) * 100)}%` : "—" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-linen-200 bg-linen-50 p-5">
              <p className="text-3xl font-semibold text-royal-900">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Per-day table */}
        <div className="overflow-hidden rounded-2xl border border-linen-200 bg-linen-50">
          <div className="border-b border-linen-200 px-6 py-4">
            <h2 className="font-semibold text-royal-900">By day</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-linen-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Filled</th>
                  <th className="px-4 py-3 text-right">Guests / Capacity</th>
                  <th className="px-4 py-3 text-right">Open Slots</th>
                  <th className="px-6 py-3 text-right">Checked In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linen-200">
                {days.map((d) => {
                  const pct = d.capacity > 0 ? Math.round((d.guests / d.capacity) * 100) : 0;
                  const badgeStyle: React.CSSProperties =
                    pct >= 100
                      ? { background: "#dcfce7", color: "#166534" }
                      : pct >= 50
                      ? { background: "#fef9c3", color: "#854d0e" }
                      : { background: "#e7e3db", color: "#475569" };
                  const openSlots = Math.max(0, d.capacity - d.guests);
                  return (
                    <tr key={d.date} className="hover:bg-linen-100">
                      <td className="px-6 py-4">
                        <p className="font-medium text-royal-900">{weekdayName(d.date)}</p>
                        <p className="text-slate-500">{formatDateLong(d.date)}</p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span style={badgeStyle} className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold">
                          {pct}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-royal-900">
                        {d.guests} <span className="font-normal text-slate-400">/ {d.capacity}</span>
                      </td>
                      <td className="px-4 py-4 text-right text-royal-900">{openSlots}</td>
                      <td className="px-6 py-4 text-right text-royal-900">{d.checkedIn}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Per-slot breakdown */}
        <div className="mt-8 space-y-6">
          <h2 className="font-semibold text-royal-900">By time slot</h2>
          {Array.from(slotsByDate.entries()).map(([date, slots]) => (
            <div key={date} className="overflow-hidden rounded-2xl border border-linen-200 bg-linen-50">
              <div className="border-b border-linen-200 bg-royal-900 px-6 py-3">
                <p className="text-sm font-semibold text-gold-300">{weekdayName(date)} · {formatDateLong(date)}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-linen-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-6 py-2">Time</th>
                      <th className="px-4 py-2 text-right">Filled</th>
                      <th className="px-4 py-2 text-right">Guests / Capacity</th>
                      <th className="px-6 py-2 text-right">Checked In</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-linen-200">
                    {slots.map((s) => {
                      const confirmed = s.reservations.filter((r) => r.status === "confirmed");
                      const guests = confirmed.reduce((n, r) => n + r.party_size, 0);
                      const checkedIn = s.reservations.filter((r) => r.checked_in && r.status === "confirmed").length;
                      const pct = s.capacity > 0 ? Math.round((guests / s.capacity) * 100) : 0;
                      const badgeStyle: React.CSSProperties =
                        pct >= 100
                          ? { background: "#dcfce7", color: "#166534" }
                          : pct >= 50
                          ? { background: "#fef9c3", color: "#854d0e" }
                          : { background: "#e7e3db", color: "#475569" };
                      return (
                        <tr key={s.start_time} className="hover:bg-linen-100">
                          <td className="px-6 py-3 font-medium text-royal-900">{formatTime(s.start_time)}</td>
                          <td className="px-4 py-3 text-right">
                            <span style={badgeStyle} className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold">
                              {pct}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-royal-900">
                            {guests} <span className="font-normal text-slate-400">/ {s.capacity}</span>
                          </td>
                          <td className="px-6 py-3 text-right text-royal-900">{checkedIn}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
