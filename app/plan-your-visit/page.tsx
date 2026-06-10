import type { Metadata } from "next";
import {
  MapPin,
  Clock,
  Ticket,
  Car,
  CalendarDays,
  Accessibility,
  Mail,
  ChevronDown,
} from "lucide-react";
import BookingWidget from "@/components/BookingWidget";
import SectionHeading from "@/components/SectionHeading";
import { LinkButton } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { site, fullAddress } from "@/lib/site";
import type { AvailableSlot } from "@/lib/types";

export const metadata: Metadata = {
  title: "Plan Your Visit",
  description: `Reserve a free guided tour of the Castle Rock Tabernacle. ${fullAddress()}.`,
};

// Always render fresh availability.
export const dynamic = "force-dynamic";

async function getInitialSlots(): Promise<AvailableSlot[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("available_slots")
      .select("*")
      .order("slot_date", { ascending: true })
      .order("start_time", { ascending: true });
    return (data ?? []) as AvailableSlot[];
  } catch {
    // If the DB isn't configured yet, the widget refetches client-side.
    return [];
  }
}

const faqs = [
  {
    q: "How much does the tour cost?",
    a: "Nothing — admission and the guided tour are completely free. Reservations simply help us keep groups a comfortable size.",
  },
  {
    q: "How long does a tour take?",
    a: "Plan on about 45 minutes for the guided walk-through. We ask that you arrive 10 minutes before your start time so your group can begin together.",
  },
  {
    q: "Can I bring children?",
    a: "Absolutely. The tour is family-friendly, and guides are happy to engage visitors of all ages. Just include everyone in your party size when you reserve.",
  },
  {
    q: "Can I bring a large group or congregation?",
    a: "Yes — choose a party size when reserving, and if your group is larger than the spots remaining in a single time slot, contact us and we'll help arrange a time for you.",
  },
  {
    q: "Is the tour wheelchair accessible?",
    a: "Yes. The walking route is on level ground and accessible to wheelchairs and strollers, and free parking is right on site.",
  },
  {
    q: "What if my plans change?",
    a: "No problem. Your confirmation email includes a link to manage or cancel your reservation — cancelling frees the spot for someone else.",
  },
];

export default async function PlanYourVisitPage() {
  const initialSlots = await getInitialSlots();

  return (
    <>
      {/* ── Hero: the essentials at a glance, action one tap away ── */}
      <section className="border-b border-linen-200 bg-linen-50 py-14 text-center sm:py-16">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-700">Plan Your Visit</p>
          <h1 className="mt-4 text-4xl font-semibold text-royal-900 sm:text-5xl">Reserve your free tour</h1>

          {/* Quick facts — answer the first three questions before they're asked */}
          <div className="mx-auto mt-7 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-royal-800">
            <span className="flex items-center gap-2">
              <CalendarDays size={16} className="text-gold-700" /> {site.season}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} className="text-gold-700" /> About 45 minutes
            </span>
            <span className="flex items-center gap-2">
              <Ticket size={16} className="text-gold-700" /> Free admission
            </span>
          </div>

          <div className="mt-8">
            <LinkButton href="#reserve" variant="gold">
              <Ticket size={18} /> See available times
            </LinkButton>
          </div>
        </div>
      </section>

      {/* ── Reserve: booking widget + know-before-you-go sidebar ── */}
      <section id="reserve" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
          <BookingWidget initialSlots={initialSlots} />

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-linen-200 bg-linen-50 p-6">
              <h2 className="font-display text-xl font-semibold text-royal-900">Know before you go</h2>
              <ul className="mt-4 space-y-4 text-sm text-royal-800">
                <li className="flex items-start gap-3">
                  <Clock size={18} className="mt-0.5 shrink-0 text-gold-700" />
                  <span>Arrive <strong>10 minutes early</strong> so your group can start together. The guided walk lasts about 45 minutes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Car size={18} className="mt-0.5 shrink-0 text-gold-700" />
                  <span>Free parking is available on site, steps from the entrance.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Accessibility size={18} className="mt-0.5 shrink-0 text-gold-700" />
                  <span>The route is level and accessible for wheelchairs and strollers — all ages are welcome.</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-gold-700" />
                  <a href={site.mapUrl} target="_blank" rel="noreferrer" className="hover:text-gold-700">
                    {fullAddress()}
                    <br />
                    <span className="text-slate-500">Open in Google Maps →</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-linen-200 bg-white p-6 text-sm">
              <p className="flex items-start gap-3 text-royal-800">
                <Mail size={18} className="mt-0.5 shrink-0 text-gold-700" />
                <span>
                  Bringing a large group, or have a question first?{" "}
                  <a href="/contact" className="font-medium text-gold-700 hover:text-gold-600">Contact us</a>{" "}
                  and we&apos;ll help you plan.
                </span>
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="bg-linen-100 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5">
          <SectionHeading
            center
            eyebrow="Good to Know"
            title="Common questions"
            subtitle="Quick answers to what most visitors ask before they come."
          />
          <div className="mt-10 space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-linen-200 bg-linen-50 px-6 py-4 open:bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-royal-900 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown size={18} className="shrink-0 text-gold-700 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Getting here ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-5 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Getting Here"
              title="Where to find us"
              subtitle="The Tabernacle exhibit is easy to reach with free, on-site parking."
            />
            <div className="mt-6 space-y-4 text-sm">
              <a href={site.mapUrl} target="_blank" rel="noreferrer" className="flex items-start gap-3 text-royal-800 hover:text-gold-700">
                <MapPin size={20} className="mt-0.5 shrink-0 text-gold-700" />
                <span>{fullAddress()}<br /><span className="text-slate-500">Open in Google Maps →</span></span>
              </a>
              <p className="flex items-start gap-3 text-royal-800">
                <Car size={20} className="mt-0.5 shrink-0 text-gold-700" />
                <span>Free parking on site</span>
              </p>
              <p className="flex items-start gap-3 text-royal-800">
                <Clock size={20} className="mt-0.5 shrink-0 text-gold-700" />
                <span>Tours: {site.season}</span>
              </p>
            </div>
            <div className="mt-8">
              <LinkButton href="#reserve" variant="primary">
                <Ticket size={18} /> Reserve a time
              </LinkButton>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-linen-200">
            <iframe
              title="Map to the Castle Rock Tabernacle"
              className="h-72 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddress())}&output=embed`}
            />
          </div>
        </div>
      </section>
    </>
  );
}
