"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Lock, LockOpen, Users, Loader2 } from "lucide-react";
import { formatDateLong, formatTimeRange } from "@/lib/booking";

export interface AdminSlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  status: "open" | "closed";
  booked: number;
}

export default function SlotsList({ slots }: { slots: AdminSlot[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function toggleStatus(slot: AdminSlot) {
    setBusyId(slot.id);
    setError("");
    try {
      const res = await fetch("/api/admin/slots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slot.id, status: slot.status === "open" ? "closed" : "open" }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Update failed.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(slot: AdminSlot) {
    if (!confirm(`Delete the ${formatTimeRange(slot.start_time, slot.end_time)} tour on ${formatDateLong(slot.slot_date)}?`)) return;
    setBusyId(slot.id);
    setError("");
    try {
      const res = await fetch("/api/admin/slots", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slot.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Delete failed.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-linen-300 bg-linen-50 p-10 text-center text-sm text-slate-500">
        No tour slots yet. Use the generator above to create some.
      </div>
    );
  }

  // Group by date
  const byDate = slots.reduce<Record<string, AdminSlot[]>>((acc, s) => {
    (acc[s.slot_date] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {error && <p className="rounded-lg bg-scarlet-600/10 px-4 py-3 text-sm text-scarlet-600">{error}</p>}
      {Object.entries(byDate).map(([date, daySlots]) => (
        <div key={date} className="overflow-hidden rounded-2xl border border-linen-200 bg-linen-50">
          <div className="border-b border-linen-200 bg-linen-100 px-5 py-3">
            <h3 className="font-semibold text-royal-900">{formatDateLong(date)}</h3>
          </div>
          <ul className="divide-y divide-linen-200">
            {daySlots.map((s) => {
              const busy = busyId === s.id;
              const full = s.booked >= s.capacity;
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-royal-900">{formatTimeRange(s.start_time, s.end_time)}</span>
                    {s.status === "closed" && (
                      <span className="rounded-full bg-royal-800/10 px-2 py-0.5 text-xs font-medium text-royal-700">Closed</span>
                    )}
                    {full && s.status === "open" && (
                      <span className="rounded-full bg-scarlet-600/10 px-2 py-0.5 text-xs font-medium text-scarlet-600">Full</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Users size={14} className="text-gold-700" />
                      {s.booked}/{s.capacity}
                    </span>
                    <button
                      onClick={() => toggleStatus(s)}
                      disabled={busy}
                      title={s.status === "open" ? "Close slot" : "Reopen slot"}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-slate-600 hover:bg-linen-200 hover:text-royal-900 disabled:opacity-50"
                    >
                      {busy ? <Loader2 className="animate-spin" size={15} /> : s.status === "open" ? <Lock size={15} /> : <LockOpen size={15} />}
                      <span className="hidden sm:inline">{s.status === "open" ? "Close" : "Open"}</span>
                    </button>
                    <button
                      onClick={() => remove(s)}
                      disabled={busy}
                      title="Delete slot"
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-slate-600 hover:bg-scarlet-600/10 hover:text-scarlet-600 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
