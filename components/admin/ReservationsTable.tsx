"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, XCircle, Loader2, Search } from "lucide-react";
import { formatDateLong, formatDateShort, formatTimeRange } from "@/lib/booking";

export interface AdminReservation {
  id: string;
  confirmation_code: string;
  name: string;
  email: string;
  phone: string | null;
  party_size: number;
  status: "confirmed" | "cancelled";
  created_at: string;
  slot_date: string | null;
  start_time: string | null;
  end_time: string | null;
}

export default function ReservationsTable({ reservations }: { reservations: AdminReservation[] }) {
  const router = useRouter();
  const [dateFilter, setDateFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const dates = useMemo(
    () => Array.from(new Set(reservations.map((r) => r.slot_date).filter(Boolean) as string[])).sort(),
    [reservations]
  );

  const filtered = reservations.filter((r) => {
    if (dateFilter !== "all" && r.slot_date !== dateFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!r.name.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q) && !r.confirmation_code.toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  async function cancel(r: AdminReservation) {
    if (!confirm(`Cancel ${r.name}'s reservation (${r.confirmation_code})? This frees their spot.`)) return;
    setBusyId(r.id);
    setError("");
    try {
      const res = await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id, status: "cancelled" }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Update failed.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, code…"
              className="rounded-lg border border-linen-300 bg-linen-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-gold-500"
            />
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-linen-300 bg-linen-50 px-3 py-2 text-sm outline-none focus:border-gold-500"
          >
            <option value="all">All dates</option>
            {dates.map((d) => (
              <option key={d} value={d}>{formatDateShort(d)}</option>
            ))}
          </select>
        </div>
        <a
          href="/api/admin/reservations/export"
          className="flex items-center gap-1.5 rounded-lg border border-linen-300 bg-linen-50 px-3 py-2 text-sm font-medium text-royal-800 hover:border-gold-500 hover:text-gold-700"
        >
          <Download size={15} /> Export CSV
        </a>
      </div>

      {error && <p className="rounded-lg bg-scarlet-600/10 px-4 py-3 text-sm text-scarlet-600">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-linen-200 bg-linen-50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-linen-200 bg-linen-100 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Tour</th>
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Party</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-linen-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">No reservations match.</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className={r.status === "cancelled" ? "opacity-50" : ""}>
                    <td className="px-4 py-3 text-royal-800">
                      {r.slot_date ? (
                        <>
                          <div className="font-medium">{formatDateLong(r.slot_date)}</div>
                          <div className="text-xs text-slate-500">{r.start_time && r.end_time ? formatTimeRange(r.start_time, r.end_time) : ""}</div>
                        </>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-royal-900">{r.name}</div>
                      <div className="text-xs text-slate-500">{r.email}{r.phone ? ` · ${r.phone}` : ""}</div>
                    </td>
                    <td className="px-4 py-3 text-royal-800">{r.party_size}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.confirmation_code}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.status === "confirmed" ? "bg-gold-500/15 text-gold-700" : "bg-royal-800/10 text-royal-700"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === "confirmed" && (
                        <button
                          onClick={() => cancel(r)}
                          disabled={busyId === r.id}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-600 hover:bg-scarlet-600/10 hover:text-scarlet-600 disabled:opacity-50"
                        >
                          {busyId === r.id ? <Loader2 className="animate-spin" size={14} /> : <XCircle size={14} />}
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-slate-500">{filtered.length} of {reservations.length} reservation{reservations.length === 1 ? "" : "s"}</p>
    </div>
  );
}
