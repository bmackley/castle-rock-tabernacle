"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { generateSlots, WEEKDAYS } from "@/lib/booking";

const inputClass =
  "w-full rounded-lg border border-linen-300 bg-linen-50 px-3 py-2 text-sm text-royal-900 outline-none focus:border-gold-500";
const labelClass = "mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600";

export default function SlotGenerator() {
  const router = useRouter();
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "17:00",
    intervalMinutes: 30,
    durationMinutes: 45,
    capacity: 20,
  });
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleWeekday(d: number) {
    setWeekdays((w) => (w.includes(d) ? w.filter((x) => x !== d) : [...w, d]));
  }

  // Live preview of how many slots this rule will create.
  const preview =
    form.startDate && form.endDate
      ? generateSlots({ ...form, weekdays }).length
      : 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("working");
    setMessage("");
    try {
      const res = await fetch("/api/admin/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, weekdays }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Could not create slots.");
      setStatus("done");
      setMessage(
        `Created ${body.created} slot${body.created === 1 ? "" : "s"}` +
          (body.skipped > 0 ? ` (${body.skipped} already existed).` : ".")
      );
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-linen-200 bg-linen-50 p-6">
      <div className="flex items-center gap-2">
        <Wand2 className="text-gold-700" size={20} />
        <h2 className="text-lg font-semibold text-royal-900">Generate tour slots</h2>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Set a date range and a daily schedule — we&apos;ll create every tour time at once.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Start date</label>
          <input type="date" required className={inputClass} value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>End date</label>
          <input type="date" required className={inputClass} value={form.endDate} onChange={(e) => update("endDate", e.target.value)} />
        </div>
      </div>

      <div className="mt-4">
        <label className={labelClass}>Days of week <span className="text-slate-400">(none = every day)</span></label>
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((d) => {
            const active = weekdays.includes(d.value);
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleWeekday(d.value)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? "border-gold-500 bg-gold-500/15 text-gold-700" : "border-linen-300 text-slate-600 hover:border-gold-400"
                }`}
              >
                {d.short}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>First tour starts</label>
          <input type="time" required className={inputClass} value={form.startTime} onChange={(e) => update("startTime", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Last tour by</label>
          <input type="time" required className={inputClass} value={form.endTime} onChange={(e) => update("endTime", e.target.value)} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Every (minutes)</label>
          <input type="number" min={5} step={5} required className={inputClass} value={form.intervalMinutes} onChange={(e) => update("intervalMinutes", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Tour length (min)</label>
          <input type="number" min={5} step={5} required className={inputClass} value={form.durationMinutes} onChange={(e) => update("durationMinutes", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Capacity each</label>
          <input type="number" min={1} required className={inputClass} value={form.capacity} onChange={(e) => update("capacity", Number(e.target.value))} />
        </div>
      </div>

      {message && (
        <p className={`mt-4 flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${
          status === "error" ? "bg-scarlet-600/10 text-scarlet-600" : "bg-gold-500/15 text-gold-700"
        }`}>
          {status === "error" ? <AlertCircle size={16} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={16} className="mt-0.5 shrink-0" />}
          {message}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" disabled={status === "working"}>
          {status === "working" ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
          {status === "working" ? "Creating…" : "Generate Slots"}
        </Button>
        {preview > 0 && (
          <span className="text-sm text-slate-600">
            Will create <strong className="text-royal-900">{preview}</strong> tour time{preview === 1 ? "" : "s"}.
          </span>
        )}
      </div>
    </form>
  );
}
