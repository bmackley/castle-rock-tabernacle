import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, Ticket, Users, CheckCircle2, SearchX, History } from "lucide-react";
import CancelReservation from "@/components/CancelReservation";
import AddToCalendar from "@/components/AddToCalendar";
import { LinkButton } from "@/components/ui/Button";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateLong, formatTimeRange } from "@/lib/booking";
import { site, fullAddress } from "@/lib/site";

export const metadata: Metadata = {
  title: "Manage Your Reservation",
  robots: { index: false },
};

// Reservation status can change at any time — always render fresh.
export const dynamic = "force-dynamic";

interface ReservationDetails {
  name: string;
  party_size: number;
  status: "confirmed" | "cancelled";
  confirmation_code: string;
  tour_slots: { slot_date: string; start_time: string; end_time: string } | null;
}

// The confirmation code is only ever sent to the guest's email, so possessing
// the link is proof of ownership — no account or login needed. Cancelling
// (the destructive action) additionally requires the booking email.
async function getReservation(code: string): Promise<ReservationDetails | null | "error"> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("reservations")
      .select("name, party_size, status, confirmation_code, tour_slots(slot_date, start_time, end_time)")
      .eq("confirmation_code", code)
      .maybeSingle();
    if (error) return "error";
    return (data as unknown as ReservationDetails) ?? null;
  } catch {
    return "error";
  }
}

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cleanCode = decodeURIComponent(code).toUpperCase();
  const reservation = await getReservation(cleanCode);

  // ── Couldn't reach the database ─────────────────────────────
  if (reservation === "error") {
    return (
      <section className="mx-auto max-w-xl px-5 py-20 text-center">
        <h1 className="text-3xl font-semibold text-royal-900">Manage your reservation</h1>
        <p className="mt-4 text-slate-600">
          We couldn&apos;t load your reservation right now. Please try again in a moment, or{" "}
          <Link href="/contact" className="font-medium text-gold-700 hover:text-gold-600">contact us</Link>{" "}
          and we&apos;ll take care of it.
        </p>
      </section>
    );
  }

  // ── Unknown code ────────────────────────────────────────────
  if (reservation === null) {
    return (
      <section className="mx-auto max-w-xl px-5 py-20 text-center">
        <SearchX className="mx-auto text-gold-700" size={44} />
        <h1 className="mt-4 text-3xl font-semibold text-royal-900">Reservation not found</h1>
        <p className="mt-3 text-slate-600">
          We couldn&apos;t find a reservation with code{" "}
          <span className="font-mono font-semibold text-royal-900">{cleanCode}</span>. Double-check
          the link in your confirmation email, or reserve a new time below.
        </p>
        <div className="mt-8">
          <LinkButton href="/plan-your-visit#reserve" variant="primary">
            <Ticket size={18} /> Reserve a Tour
          </LinkButton>
        </div>
      </section>
    );
  }

  const slot = reservation.tour_slots;
  const cancelled = reservation.status === "cancelled";
  const past = slot ? slot.slot_date < localToday() : false;

  return (
    <section className="mx-auto max-w-xl px-5 py-16 sm:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-700">Your Reservation</p>
      <h1 className="mt-3 text-3xl font-semibold text-royal-900">
        {cancelled ? "This reservation was cancelled" : past ? "Thanks for visiting" : `See you soon, ${reservation.name.split(" ")[0]}!`}
      </h1>

      {/* Details card */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-linen-200 bg-linen-50 shadow-sm">
        <div className="flex items-center justify-between bg-royal-900 px-6 py-4 text-linen-50">
          <p className="flex items-center gap-2 text-sm font-semibold text-gold-300">
            <Ticket size={16} /> {reservation.confirmation_code}
          </p>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              cancelled ? "bg-scarlet-600/20 text-linen-100" : "bg-gold-500 text-royal-900"
            }`}
          >
            {cancelled ? "Cancelled" : "Confirmed"}
          </span>
        </div>

        <dl className="space-y-4 p-6 text-sm sm:p-8">
          {slot && (
            <>
              <div className="flex items-start gap-3">
                <CalendarDays size={18} className="mt-0.5 shrink-0 text-gold-700" />
                <div>
                  <dt className="text-slate-500">Date</dt>
                  <dd className="font-semibold text-royal-900">{formatDateLong(slot.slot_date)}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={18} className="mt-0.5 shrink-0 text-gold-700" />
                <div>
                  <dt className="text-slate-500">Time</dt>
                  <dd className="font-semibold text-royal-900">
                    {formatTimeRange(slot.start_time, slot.end_time)}
                    <span className="ml-2 font-normal text-slate-500">· please arrive 10 minutes early</span>
                  </dd>
                </div>
              </div>
            </>
          )}
          <div className="flex items-start gap-3">
            <Users size={18} className="mt-0.5 shrink-0 text-gold-700" />
            <div>
              <dt className="text-slate-500">Party</dt>
              <dd className="font-semibold text-royal-900">
                {reservation.name} · {reservation.party_size} {reservation.party_size === 1 ? "guest" : "guests"}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin size={18} className="mt-0.5 shrink-0 text-gold-700" />
            <div>
              <dt className="text-slate-500">Where</dt>
              <dd className="font-semibold text-royal-900">
                {fullAddress()}
                <br />
                <a href={site.mapUrl} target="_blank" rel="noreferrer" className="font-normal text-gold-700 hover:text-gold-600">
                  Open in Google Maps →
                </a>
              </dd>
            </div>
          </div>
        </dl>
      </div>

      {/* Active reservation: calendar + cancel */}
      {!cancelled && !past && slot && (
        <>
          <div className="mt-6">
            <AddToCalendar
              event={{
                slotDate: slot.slot_date,
                startTime: slot.start_time,
                endTime: slot.end_time,
                code: reservation.confirmation_code,
              }}
            />
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-semibold text-royal-900">Need a different time?</h2>
            <p className="mt-1 text-sm text-slate-600">
              Simply{" "}
              <Link href="/plan-your-visit#reserve" className="font-medium text-gold-700 hover:text-gold-600">
                book a new time
              </Link>{" "}
              with the same email address — we&apos;ll automatically cancel this reservation and
              email you the new details.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-royal-900">Can&apos;t make it at all?</h2>
            <p className="mt-1 text-sm text-slate-600">
              Cancelling frees your spots for other visitors.
            </p>
            <div className="mt-4">
              <CancelReservation code={cleanCode} />
            </div>
          </div>
        </>
      )}

      {/* Cancelled or past: offer to rebook */}
      {(cancelled || past) && (
        <div className="mt-8 rounded-2xl border border-linen-200 bg-white p-6 text-center">
          {cancelled ? (
            <History className="mx-auto text-gold-700" size={28} />
          ) : (
            <CheckCircle2 className="mx-auto text-gold-700" size={28} />
          )}
          <p className="mt-3 text-sm text-slate-600">
            {cancelled
              ? "Changed your mind? Tours are free — pick a new time any time."
              : "We hope you enjoyed your walk through the Tabernacle. You're always welcome back."}
          </p>
          <div className="mt-5">
            <LinkButton href="/plan-your-visit#reserve" variant="primary">
              <Ticket size={16} /> {cancelled ? "Reserve a New Time" : "Book Another Tour"}
            </LinkButton>
          </div>
        </div>
      )}
    </section>
  );
}
