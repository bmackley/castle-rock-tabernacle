"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Search, UserPlus, CheckCircle2, Clock, Users, Loader2, ChevronDown, ChevronUp, X, HelpCircle } from "lucide-react";
import { formatTime, formatDateLong } from "@/lib/booking";
import type { SlotWithReservations } from "./page";

const inputClass =
  "w-full rounded-lg border border-linen-300 bg-white px-4 py-3 text-sm text-royal-900 outline-none transition-colors placeholder:text-slate-400 focus:border-gold-500";

interface SearchResult {
  id: string;
  name: string;
  email: string;
  party_size: number;
  confirmation_code: string;
  checked_in: boolean;
  tour_slots: { slot_date: string; start_time: string } | null;
}

// Denver-aware current time string "HH:MM:SS"
function denverTime() {
  return new Date().toLocaleTimeString("en-CA", { timeZone: "America/Denver", hour12: false });
}

// Returns the slot id that best matches "now": last started slot, or next upcoming.
function currentSlotId(slotList: SlotWithReservations[]): string | null {
  const now = denverTime();
  const past = slotList.filter((s) => s.start_time <= now);
  if (past.length > 0) return past[past.length - 1].id;
  return slotList[0]?.id ?? null;
}

export default function CheckInClient({
  initialSlots,
  today,
  serverError,
}: {
  initialSlots: SlotWithReservations[];
  today: string;
  serverError: boolean;
}) {
  const [slots, setSlots] = useState(initialSlots);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(
    currentSlotId(initialSlots)
  );

  // Walk-in form state
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInSlotId, setWalkInSlotId] = useState<string | null>(null);
  const [walkInName, setWalkInName] = useState("");
  const [walkInParty, setWalkInParty] = useState(1);
  const [walkInEmail, setWalkInEmail] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInSubmitting, setWalkInSubmitting] = useState(false);
  const [walkInError, setWalkInError] = useState("");

  const [toastMsg, setToastMsg] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refresh slot data every 60 seconds
  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/checkin/slots?date=${today}`);
      if (!res.ok) return;
      const { slots: fresh } = await res.json();
      setSlots(fresh);
    } catch { /* silently ignore */ }
  }, [today]);

  useEffect(() => {
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [refresh]);

  // Auto-advance active slot every 30 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlotId(currentSlotId(slots));
    }, 30_000);
    return () => clearInterval(id);
  }, [slots]);

  // Search debounce
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (query.length < 2) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/checkin?q=${encodeURIComponent(query)}`);
        const { results } = await res.json();
        setSearchResults(results ?? []);
      } catch { /* ignore */ }
      finally { setSearching(false); }
    }, 300);
  }, [query]);

  function toast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  }

  function openWalkIn() {
    setWalkInSlotId(currentSlotId(slots));
    setWalkInName("");
    setWalkInParty(1);
    setWalkInEmail("");
    setWalkInPhone("");
    setWalkInError("");
    setWalkInOpen(true);
  }

  function closeWalkIn() {
    setWalkInOpen(false);
    setWalkInError("");
  }

  async function toggleCheckIn(reservationId: string, current: boolean) {
    const next = !current;
    setSlots((prev) =>
      prev.map((s) => ({
        ...s,
        reservations: s.reservations.map((r) =>
          r.id === reservationId ? { ...r, checked_in: next } : r
        ),
      }))
    );
    setSearchResults((prev) =>
      prev.map((r) => r.id === reservationId ? { ...r, checked_in: next } : r)
    );
    try {
      await fetch("/api/checkin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reservationId, checked_in: next }),
      });
      toast(next ? "Checked in" : "Check-in removed");
    } catch {
      setSlots((prev) =>
        prev.map((s) => ({
          ...s,
          reservations: s.reservations.map((r) =>
            r.id === reservationId ? { ...r, checked_in: current } : r
          ),
        }))
      );
      toast("Error — please try again");
    }
  }

  async function submitWalkIn() {
    if (!walkInName.trim()) { setWalkInError("Name is required."); return; }
    if (!walkInSlotId) { setWalkInError("Please select a time slot."); return; }
    setWalkInSubmitting(true);
    setWalkInError("");
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: walkInSlotId,
          name: walkInName.trim(),
          partySize: walkInParty,
          email: walkInEmail.trim() || undefined,
          phone: walkInPhone.trim() || undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) { setWalkInError(body.error ?? "Something went wrong."); return; }
      toast(`Walk-in logged: ${walkInName.trim()} (${body.code})`);
      closeWalkIn();
      await refresh();
    } catch {
      setWalkInError("Something went wrong. Please try again.");
    } finally {
      setWalkInSubmitting(false);
    }
  }

  const activeSlot = slots.find((s) => s.id === activeSlotId) ?? slots[0];

  return (
    <div className="min-h-screen bg-linen-100">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-royal-900 px-5 py-2.5 text-sm font-medium text-linen-50 shadow-lg">
          {toastMsg}
        </div>
      )}

      {/* Walk-in modal */}
      {walkInOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 sm:items-center">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-royal-900">Log a walk-in</h2>
              <button onClick={closeWalkIn} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-3">
              {/* Slot selector */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Tour time *</label>
                <select
                  value={walkInSlotId ?? ""}
                  onChange={(e) => setWalkInSlotId(e.target.value || null)}
                  className={inputClass}
                >
                  {slots.length === 0 && (
                    <option value="">No slots today</option>
                  )}
                  {slots.map((s) => (
                    <option key={s.id} value={s.id}>{formatTime(s.start_time)}</option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Name *</label>
                <input
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="Guest name"
                  className={inputClass}
                />
              </div>

              {/* Party size */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Party size</label>
                <select
                  value={walkInParty}
                  onChange={(e) => setWalkInParty(Number(e.target.value))}
                  className={inputClass}
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                  ))}
                </select>
              </div>

              {/* Email (optional) */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Email (optional)</label>
                <input
                  type="email"
                  value={walkInEmail}
                  onChange={(e) => setWalkInEmail(e.target.value)}
                  placeholder="guest@example.com"
                  className={inputClass}
                />
              </div>

              {/* Phone (optional) */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Phone (optional)</label>
                <input
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className={inputClass}
                />
              </div>
            </div>

            {walkInError && (
              <p className="mt-2 text-sm text-scarlet-600">{walkInError}</p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={submitWalkIn}
                disabled={walkInSubmitting}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-royal-900 px-4 py-2.5 text-sm font-semibold text-linen-50 hover:bg-royal-800 disabled:opacity-50"
              >
                {walkInSubmitting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                {walkInSubmitting ? "Logging…" : "Log walk-in"}
              </button>
              <button
                onClick={closeWalkIn}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-linen-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-700">Volunteer Tool</p>
            <h1 className="mt-1 text-2xl font-semibold text-royal-900">Tour Check-In</h1>
            <p className="mt-0.5 text-sm text-slate-500">{formatDateLong(today)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/checkin/sop"
              target="_blank"
              className="mt-1 flex items-center gap-1.5 rounded-full border border-linen-300 bg-linen-50 px-3 py-2 text-sm font-medium text-slate-600 hover:border-gold-500 hover:text-royal-900"
            >
              <HelpCircle size={15} /> Help
            </Link>
            <button
              onClick={openWalkIn}
              className="mt-1 flex items-center gap-1.5 rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-royal-900 hover:bg-gold-400"
            >
              <UserPlus size={15} /> Walk-in
            </button>
          </div>
        </div>

        {serverError && (
          <p className="mb-6 rounded-xl bg-scarlet-600/10 px-4 py-3 text-sm text-scarlet-700">
            Could not reach the database. Check your connection and refresh.
          </p>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold-700" />
            <input
              type="search"
              placeholder="Search by name, email, or confirmation code…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${inputClass} pl-11`}
            />
            {searching && (
              <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
            )}
          </div>

          {query.length >= 2 && (
            <div className="mt-2 overflow-hidden rounded-xl border border-linen-200 bg-white shadow-sm">
              {searchResults.length === 0 && !searching ? (
                <p className="px-4 py-4 text-sm text-slate-500">No reservations found for &quot;{query}&quot;.</p>
              ) : (
                <ul className="divide-y divide-linen-100">
                  {searchResults.map((r) => (
                    <li key={r.id} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-royal-900">{r.name}</p>
                          <p className="text-xs text-slate-500">
                            {r.party_size} {r.party_size === 1 ? "guest" : "guests"} ·{" "}
                            {r.tour_slots ? `${formatDateLong(r.tour_slots.slot_date)} at ${formatTime(r.tour_slots.start_time)}` : "—"} ·{" "}
                            {r.confirmation_code}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleCheckIn(r.id, r.checked_in)}
                          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                            r.checked_in
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-linen-200 text-slate-700 hover:bg-gold-500/20"
                          }`}
                        >
                          {r.checked_in ? "Checked in" : "Check in"}
                        </button>
                      </div>
                      <a
                        href={`/reservation/${r.confirmation_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs font-semibold text-gold-700 hover:text-gold-600 hover:underline"
                      >
                        Manage / Cancel →
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* No slots today */}
        {slots.length === 0 && !serverError && (
          <div className="rounded-2xl border border-linen-200 bg-linen-50 p-10 text-center">
            <Clock className="mx-auto text-gold-700" size={32} />
            <p className="mt-3 font-medium text-royal-900">No open tour slots today</p>
            <p className="mt-1 text-sm text-slate-500">
              Tours run June 21–28. Use the search bar above to look up any reservation.
            </p>
          </div>
        )}

        {/* Slot tabs */}
        {slots.length > 0 && (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {slots.map((s) => {
                const checkedIn = s.reservations.filter((r) => r.checked_in).length;
                const total = s.reservations.reduce((n, r) => n + r.party_size, 0);
                const isActive = s.id === activeSlotId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSlotId(s.id)}
                    className={`rounded-xl border px-4 py-2.5 text-left transition-colors ${
                      isActive
                        ? "border-gold-500 bg-gold-500/10"
                        : "border-linen-300 bg-linen-50 hover:border-gold-400"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-royal-900">{formatTime(s.start_time)}</span>
                    <span className="block text-xs text-slate-500">{checkedIn}/{total} guests</span>
                  </button>
                );
              })}
            </div>

            {activeSlot && (
              <div className="overflow-hidden rounded-2xl border border-linen-200 bg-linen-50">
                {/* Slot header */}
                <div className="flex items-center justify-between border-b border-linen-200 bg-royal-900 px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-gold-300">{formatTime(activeSlot.start_time)}</p>
                    <p className="text-xs text-linen-200/70">
                      {activeSlot.reservations.filter((r) => r.checked_in).length} of{" "}
                      {activeSlot.reservations.reduce((n, r) => n + r.party_size, 0)} guests checked in
                    </p>
                  </div>
                  <span className="text-xs text-linen-200/70">
                    {activeSlot.capacity - activeSlot.reservations.reduce((n, r) => n + r.party_size, 0)} spots remaining
                  </span>
                </div>

                {/* Reservation list */}
                {activeSlot.reservations.length === 0 ? (
                  <p className="px-6 py-8 text-center text-sm text-slate-500">No reservations for this slot.</p>
                ) : (
                  <ul className="divide-y divide-linen-200">
                    {activeSlot.reservations.map((r) => (
                      <ReservationRow key={r.id} r={r} onToggle={toggleCheckIn} />
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ReservationRow({
  r,
  onToggle,
}: {
  r: SlotWithReservations["reservations"][0];
  onToggle: (id: string, current: boolean) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pending, setPending] = useState(false);

  async function handle() {
    setPending(true);
    await onToggle(r.id, r.checked_in);
    setPending(false);
  }

  return (
    <li className={`transition-colors ${r.checked_in ? "bg-green-50/60" : ""}`}>
      <div className="flex items-center gap-4 px-6 py-4">
        <button
          onClick={handle}
          disabled={pending}
          className={`shrink-0 rounded-full p-1.5 transition-colors ${
            r.checked_in
              ? "bg-green-500 text-white hover:bg-green-600"
              : "border-2 border-linen-300 text-transparent hover:border-gold-500"
          } ${pending ? "opacity-50" : ""}`}
          aria-label={r.checked_in ? "Remove check-in" : "Check in"}
        >
          <CheckCircle2 size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <p className={`truncate font-medium ${r.checked_in ? "text-green-900" : "text-royal-900"}`}>
            {r.name}
          </p>
          <p className="flex items-center gap-1 text-xs text-slate-500">
            <Users size={11} /> {r.party_size} {r.party_size === 1 ? "guest" : "guests"}
          </p>
        </div>

        <button
          onClick={() => setExpanded((e) => !e)}
          className="shrink-0 text-slate-400 hover:text-slate-600"
          aria-label="Show details"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-linen-100 bg-white/50 px-6 py-3 text-xs text-slate-500">
          <p>{r.email === "walkin@castlerocktabernacle.com" ? <em>Walk-in</em> : r.email}</p>
          {r.phone && <p>{r.phone}</p>}
          <div className="mt-1.5 flex items-center justify-between gap-4">
            <p className="font-mono">{r.confirmation_code}</p>
            <a
              href={`/reservation/${r.confirmation_code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans font-semibold text-gold-700 hover:text-gold-600 hover:underline"
            >
              Manage / Cancel →
            </a>
          </div>
        </div>
      )}
    </li>
  );
}
