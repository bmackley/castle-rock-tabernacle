"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, XCircle, Loader2, Search, CalendarClock, ChevronDown, Check } from "lucide-react";
import { formatDateLong, formatDateShort, formatTime } from "@/lib/booking";

export interface AdminReservation {
  id: string;
  confirmation_code: string;
  name: string;
  email: string;
  phone: string | null;
  party_size: number;
  status: "confirmed" | "cancelled";
  checked_in: boolean;
  created_at: string;
  slot_date: string | null;
  start_time: string | null;
  end_time: string | null;
}

interface AvailableSlot {
  id: string;
  slot_date: string;
  start_time: string;
  capacity: number;
}

function RescheduleDropdown({ r, onDone }: { r: AdminReservation; onDone: () => void }) {
  const [slots, setSlots] = useState<AvailableSlot[] | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (slots !== null) { setOpen((o) => !o); return; }
    const res = await fetch("/api/admin/reservations");
    const { slots: data } = await res.json();
    setSlots(data ?? []);
    setOpen(true);
  }

  async function moveTo(slotId: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/reservations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id, slot_id: slotId }),
      });
      const body = await res.json();
      if (!res.ok) { setError(body.error ?? "Could not move reservation."); return; }
      setOpen(false);
      onDone();
    } catch {
      setError("Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={load}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-600 hover:bg-gold-500/10 hover:text-gold-700"
      >
        <CalendarClock size={14} /> Reschedule <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 max-h-64 w-64 overflow-y-auto rounded-xl border border-linen-200 bg-white shadow-lg">
          {error && <p className="px-3 py-2 text-xs text-scarlet-600">{error}</p>}
          {slots === null ? (
            <p className="px-3 py-3 text-xs text-slate-500">Loading…</p>
          ) : slots.length === 0 ? (
            <p className="px-3 py-3 text-xs text-slate-500">No open slots available.</p>
          ) : (
            <ul className="divide-y divide-linen-100 py-1">
              {slots.map((s) => {
                const isCurrent = r.slot_date === s.slot_date && r.start_time === s.start_time;
                return (
                  <li key={s.id}>
                    <button
                      disabled={busy || isCurrent}
                      onClick={() => moveTo(s.id)}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                        isCurrent
                          ? "text-slate-400"
                          : "hover:bg-linen-50 text-royal-900"
                      }`}
                    >
                      <span>
                        <span className="font-medium">{formatDateShort(s.slot_date)}</span>
                        {" · "}{formatTime(s.start_time)}
                      </span>
                      {isCurrent && <Check size={12} className="text-gold-600" />}
                      {busy && !isCurrent && <Loader2 size={12} className="animate-spin text-slate-400" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReservationsTable({ reservations }: { reservations: AdminReservation[] }) {
  const router = useRouter();
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("confirmed");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const dates = useMemo(
    () => Array.from(new Set(reservations.map((r) => r.slot_date).filter(Boolean) as string[])).sort(),
    [reservations]
  );

  const filtered = reservations.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (dateFilter !== "all" && r.slot_date !== dateFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      if (
        !r.name.toLowerCase().includes(q) &&
        !r.email.toLowerCase().includes(q) &&
        !r.confirmation_code.toLowerCase().includes(q)
      ) return false;
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

  async function restore(r: AdminReservation) {
    setBusyId(r.id);
    setError("");
    try {
      const res = await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id, status: "confirmed" }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Update failed.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  const confirmedCount = filtered.filter((r) => r.status === "confirmed").length;
  const guestCount = filtered.filter((r) => r.status === "confirmed").reduce((n, r) => n + r.party_size, 0);
  const checkedInCount = filtered.filter((r) => r.checked_in).length;

  return (
    <div className="space-y-4">
      {/* Filters */}
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-linen-300 bg-linen-50 px-3 py-2 text-sm outline-none focus:border-gold-500"
          >
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="all">All statuses</option>
          </select>
        </div>
        <a
          href="/api/admin/reservations/export"
          className="flex items-center gap-1.5 rounded-lg border border-linen-300 bg-linen-50 px-3 py-2 text-sm font-medium text-royal-800 hover:border-gold-500 hover:text-gold-700"
        >
          <Download size={15} /> Export CSV
        </a>
      </div>

      {/* Summary bar */}
      <div className="flex gap-4 text-sm text-slate-600">
        <span><strong className="text-royal-900">{confirmedCount}</strong> reservations</span>
        <span><strong className="text-royal-900">{guestCount}</strong> guests</span>
        <span><strong className="text-royal-900">{checkedInCount}</strong> checked in</span>
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
                <th className="px-4 py-3 font-medium">Checked In</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-linen-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">No reservations match.</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className={r.status === "cancelled" ? "opacity-50" : ""}>
                    <td className="px-4 py-3 text-royal-800">
                      {r.slot_date ? (
                        <>
                          <div className="font-medium">{formatDateLong(r.slot_date)}</div>
                          <div className="text-xs text-slate-500">{r.start_time ? formatTime(r.start_time) : ""}</div>
                        </>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-royal-900">{r.name}</div>
                      <div className="text-xs text-slate-500">
                        {r.email === "walkin@castlerocktabernacle.com" ? <em>Walk-in</em> : r.email}
                        {r.phone ? ` · ${r.phone}` : ""}
                      </div>
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
                    <td className="px-4 py-3">
                      {r.checked_in ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          <Check size={11} /> Yes
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.status === "confirmed" && (
                          <>
                            <RescheduleDropdown r={r} onDone={() => router.refresh()} />
                            <button
                              onClick={() => cancel(r)}
                              disabled={busyId === r.id}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-600 hover:bg-scarlet-600/10 hover:text-scarlet-600 disabled:opacity-50"
                            >
                              {busyId === r.id ? <Loader2 className="animate-spin" size={14} /> : <XCircle size={14} />}
                              Cancel
                            </button>
                          </>
                        )}
                        {r.status === "cancelled" && (
                          <button
                            onClick={() => restore(r)}
                            disabled={busyId === r.id}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-600 hover:bg-gold-500/10 hover:text-gold-700 disabled:opacity-50"
                          >
                            {busyId === r.id ? <Loader2 className="animate-spin" size={14} /> : null}
                            Restore
                          </button>
                        )}
                      </div>
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
