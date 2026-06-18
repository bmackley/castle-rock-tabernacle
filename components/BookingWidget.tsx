"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, Users, CheckCircle2, Ticket, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import AddToCalendar from "@/components/AddToCalendar";
import { formatDateLong, formatDateShort, formatTime, weekdayName } from "@/lib/booking";
import type { AvailableSlot } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-linen-300 bg-linen-50 px-4 py-3 text-sm text-royal-900 outline-none transition-colors placeholder:text-slate-400 focus:border-gold-500";

interface SuccessInfo {
  code: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  partySize: number;
}

export default function BookingWidget({ initialSlots }: { initialSlots: AvailableSlot[] }) {
  const [slots, setSlots] = useState<AvailableSlot[]>(initialSlots);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(initialSlots[0]?.slot_date ?? null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<SuccessInfo | null>(null);

  // Always pull fresh availability on mount so capacity reflects reality.
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/availability")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const next: AvailableSlot[] = d.slots ?? [];
        setSlots(next);
        setSelectedDate((cur) => cur ?? next[0]?.slot_date ?? null);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Unique sorted dates that have availability.
  const dates = useMemo(() => {
    return Array.from(new Set(slots.map((s) => s.slot_date))).sort();
  }, [slots]);

  const slotsForDate = useMemo(
    () => slots.filter((s) => s.slot_date === selectedDate),
    [slots, selectedDate]
  );

  async function refreshAvailability() {
    try {
      const d = await fetch("/api/availability").then((r) => r.json());
      setSlots(d.slots ?? []);
    } catch {
      /* ignore */
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          partySize: Number(data.partySize),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Something went wrong. Please try again.");

      setSuccess({
        code: body.code,
        slotDate: body.slotDate,
        startTime: body.startTime,
        endTime: body.endTime,
        partySize: Number(data.partySize),
      });
      setSelectedSlot(null);
      refreshAvailability();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      refreshAvailability(); // capacity may have changed under us
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ──────────────────────────────────────────
  if (success) {
    return (
      <div className="rounded-3xl border border-gold-500/40 bg-linen-50 p-8 text-center shadow-sm sm:p-10">
        <CheckCircle2 className="mx-auto text-gold-700" size={48} />
        <h3 className="mt-4 text-2xl font-semibold text-royal-900">You&apos;re reserved!</h3>
        <p className="mt-2 text-slate-600">A confirmation email is on its way to you.</p>

        <div className="mx-auto mt-6 max-w-sm space-y-3 rounded-2xl bg-royal-900 p-6 text-left text-linen-50">
          <Row label="Date" value={formatDateLong(success.slotDate)} />
          <Row label="Time" value={`${formatTime(success.startTime)} · about 45 min`} />
          <Row label="Guests" value={String(success.partySize)} />
          <div className="border-t border-royal-700 pt-3">
            <Row label="Confirmation" value={success.code} strong />
          </div>
        </div>

        <div className="mt-6">
          <AddToCalendar
            event={{
              slotDate: success.slotDate,
              startTime: success.startTime,
              endTime: success.endTime,
              code: success.code,
            }}
          />
        </div>

        <p className="mt-5 text-sm text-slate-600">
          Keep your confirmation code. You can{" "}
          <a href={`/reservation/${success.code}`} className="font-medium text-gold-700 hover:text-gold-600">
            manage your reservation here
          </a>
          .
        </p>
        <button
          onClick={() => setSuccess(null)}
          className="mt-6 text-sm font-semibold text-gold-700 hover:text-gold-700"
        >
          Reserve another tour
        </button>
      </div>
    );
  }

  // ── No availability ─────────────────────────────────────────
  if (!loading && dates.length === 0) {
    return (
      <div className="rounded-3xl border border-linen-200 bg-linen-50 p-10 text-center">
        <CalendarDays className="mx-auto text-gold-700" size={40} />
        <h3 className="mt-4 text-xl font-semibold text-royal-900">Tour dates coming soon</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          Reservations aren&apos;t open just yet. Please check back, or{" "}
          <a href="/contact" className="font-medium text-gold-700 hover:text-gold-700">contact us</a>{" "}
          to be notified when tours are scheduled.
        </p>
      </div>
    );
  }

  // ── Booking panel ───────────────────────────────────────────
  return (
    <div className="overflow-hidden rounded-3xl border border-linen-200 bg-linen-50 shadow-sm">
      <div className="border-b border-linen-200 bg-royal-900 px-6 py-5 text-linen-50 sm:px-8">
        <p className="flex items-center gap-2 text-sm font-semibold text-gold-300">
          <Ticket size={16} /> Reserve your free tour
        </p>
        <p className="mt-1 text-sm text-slate-300">Choose a day and time, then tell us who&apos;s coming.</p>
      </div>

      <div className="space-y-8 p-6 sm:p-8">
        {loading && (
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="animate-spin" size={16} /> Loading available tour times…
          </p>
        )}

        {/* Step 1 — Date */}
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-royal-900">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-royal-900">1</span>
            Choose a date
          </p>
          <div className="flex flex-wrap gap-2">
            {dates.map((d) => {
              const active = d === selectedDate;
              return (
                <button
                  key={d}
                  onClick={() => {
                    setSelectedDate(d);
                    setSelectedSlot(null);
                  }}
                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                    active
                      ? "border-gold-500 bg-gold-500/10"
                      : "border-linen-300 bg-linen-50 hover:border-gold-400"
                  }`}
                >
                  <span className="block text-xs uppercase tracking-wide text-gold-700">{weekdayName(d).slice(0, 3)}</span>
                  <span className="block text-sm font-semibold text-royal-900">{formatDateShort(d).replace(/^\w+,\s/, "")}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 — Time */}
        {selectedDate && (
          <div>
            <label htmlFor="tourTime" className="mb-3 flex items-center gap-2 text-sm font-semibold text-royal-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-royal-900">2</span>
              Choose a time on {formatDateLong(selectedDate)}
            </label>
            <div className="relative">
              <Clock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold-700" />
              <select
                id="tourTime"
                value={selectedSlot?.id ?? ""}
                onChange={(e) => setSelectedSlot(slotsForDate.find((s) => s.id === e.target.value) ?? null)}
                className={`w-full appearance-none rounded-xl border-2 bg-white py-4 pl-11 pr-10 text-sm font-medium outline-none transition-colors ${
                  selectedSlot
                    ? "border-linen-300 text-royal-900"
                    : "border-gold-500 text-slate-500 ring-2 ring-gold-400/30"
                }`}
              >
                <option value="" disabled>
                  Select a tour time…
                </option>
                {slotsForDate.map((s) => (
                  <option key={s.id} value={s.id}>
                    {formatTime(s.start_time)} · {s.remaining} {s.remaining === 1 ? "spot" : "spots"} left
                  </option>
                ))}
              </select>
              {/* Chevron */}
              <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gold-700" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}

        {/* Step 3 — Details */}
        {selectedSlot && (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-linen-200 bg-white/40 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-royal-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-royal-900">3</span>
              Your details
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-royal-800">Full name</label>
                <input id="name" name="name" required className={inputClass} placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-royal-800">Email</label>
                <input id="email" name="email" type="email" required className={inputClass} placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-royal-800">Phone <span className="text-slate-500">(optional)</span></label>
                <input id="phone" name="phone" className={inputClass} placeholder="(555) 123-4567" />
              </div>
              <div>
                <label htmlFor="partySize" className="mb-1.5 block text-sm font-medium text-royal-800">
                  <Users size={13} className="-mt-0.5 mr-1 inline text-gold-700" /> Party size
                </label>
                <select id="partySize" name="partySize" defaultValue="1" className={inputClass}>
                  {Array.from({ length: Math.min(selectedSlot.remaining, 20) }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p className="flex items-start gap-2 rounded-lg bg-scarlet-600/10 px-4 py-3 text-sm text-scarlet-600">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </p>
            )}

            <Button type="submit" variant="gold" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? <Loader2 className="animate-spin" size={16} /> : <Ticket size={16} />}
              {submitting ? "Reserving…" : "Confirm Reservation"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-300">{label}</span>
      <span className={strong ? "text-lg font-bold tracking-wide text-gold-300" : "font-medium text-linen-50"}>{value}</span>
    </div>
  );
}
