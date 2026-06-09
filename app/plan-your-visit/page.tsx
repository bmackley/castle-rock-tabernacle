import type { Metadata } from "next";
import { MapPin, Clock, Ticket, Car, Users } from "lucide-react";
import BookingWidget from "@/components/BookingWidget";
import SectionHeading from "@/components/SectionHeading";
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

export default async function PlanYourVisitPage() {
  const initialSlots = await getInitialSlots();

  return (
    <>
      <section className="border-b border-linen-200 bg-linen-50 py-14 text-center sm:py-16">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-700">Plan Your Visit</p>
          <h1 className="mt-4 text-4xl font-semibold text-royal-900 sm:text-5xl">Reserve your free tour</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Guided tours run {site.season}. Choose a time below — it only takes a minute.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-5 pt-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Ticket, title: "Pick a time", text: "Choose any open tour slot that fits your schedule." },
            { icon: Users, title: "Tell us who's coming", text: "Reserve a spot for yourself, your family, or your group." },
            { icon: Clock, title: "Arrive & enjoy", text: "Come 10 minutes early. The guided walk lasts about 45 minutes." },
          ].map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-linen-200 bg-linen-50 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-royal-900">{i + 1}</span>
                <s.icon className="text-gold-700" size={20} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-royal-900">{s.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Booking widget */}
      <section id="reserve" className="mx-auto max-w-4xl scroll-mt-24 px-5 py-16">
        <BookingWidget initialSlots={initialSlots} />
      </section>

      {/* Location */}
      <section className="bg-linen-100 py-16 sm:py-20">
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
