import Image from "next/image";
import { CalendarDays, MapPin, Clock, Ticket, BookOpen, Footprints } from "lucide-react";
import { site, fullAddress } from "@/lib/site";
import { LinkButton } from "@/components/ui/Button";
import SectionHeading from "@/components/SectionHeading";
import UpcomingEvents from "@/components/UpcomingEvents";
import { learningGuides } from "@/lib/content";

// Refresh periodically so upcoming events appear/expire without a redeploy.
export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      {/* ── Hero (full-bleed panorama with overlaid text) ─────── */}
      <section className="relative isolate flex min-h-[78vh] overflow-hidden">
        <Image
          src="/tabernacle-camp.jpg"
          alt="A full-scale recreation of the ancient Tabernacle — the courtyard with the bronze laver and burning altar before the curtained tent of meeting, set in a desert camp."
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-center"
        />
        {/* Scrim: keeps the panel and buttons legible over any part of the photo */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-royal-900/45 via-royal-900/15 to-royal-900/55" />

        <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-10 px-5 py-10 sm:py-14">
          {/* Headline panel — top-left */}
          <div className="animate-fade-up max-w-xl rounded-2xl bg-royal-900/80 px-7 py-7 backdrop-blur-sm sm:px-9 sm:py-8">
            <h1 className="font-display text-4xl font-semibold leading-[1.08] text-white sm:text-5xl md:text-6xl">
              Come and Discover Christ in the Ancient Tabernacle
            </h1>
            <p className="mt-4 flex items-center gap-2 text-sm font-medium text-gold-300">
              <CalendarDays size={16} /> Free guided tours · {site.season}
            </p>
            <p className="mt-2 text-sm text-linen-200/80">
              Walk-ins welcome. Reservations receive priority admission.
            </p>
          </div>

          {/* Actions — bottom-right */}
          <div className="animate-fade-up flex flex-col items-stretch gap-3 self-stretch sm:w-72 sm:self-end">
            <LinkButton href="/plan-your-visit#reserve" variant="primary" className="justify-center">
              <Ticket size={18} /> Make a Reservation
            </LinkButton>
            <LinkButton href="/learn-more" variant="white" className="justify-center">
              Learn More
            </LinkButton>
          </div>
        </div>
      </section>

      {/* ── Special events (kick-off devotional etc.) ─────────── */}
      <UpcomingEvents />

      {/* ── Quick facts ───────────────────────────────────────── */}
      <section className="border-b border-linen-200 bg-linen-100">
        <div className="mx-auto grid max-w-5xl gap-px overflow-hidden sm:grid-cols-3">
          {[
            { icon: Ticket, label: "Free admission", detail: "No cost to visit. All are welcome." },
            { icon: Clock, label: "About 45 minutes", detail: "A guided, walk-through experience" },
            { icon: MapPin, label: fullAddress(), detail: "Easy to find, free parking" },
          ].map((f) => (
            <div key={f.label} className="bg-linen-100 px-6 py-8 text-center">
              <f.icon className="mx-auto text-gold-700" size={26} />
              <p className="mt-3 font-semibold text-royal-900">{f.label}</p>
              <p className="mt-1 text-sm text-slate-600">{f.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── The experience ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="The Experience"
              title="An ancient pattern, made to be walked through"
              subtitle="The Tabernacle was the portable sanctuary God gave to Israel, a tent of meeting where heaven touched earth. Our recreation lets you stand in the courtyard, the Holy Place, and before the veil of the Holy of Holies, as a guide unfolds the meaning of each station."
            />
            <ul className="mt-8 space-y-4">
              {[
                { icon: Footprints, text: "Walk the courtyard past the brazen altar and the laver of cleansing." },
                { icon: BookOpen, text: "Enter the Holy Place to see the lampstand, showbread, and altar of incense." },
                { icon: MapPin, text: "Stand before the veil and the ark of the covenant in the Holy of Holies." },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-full bg-gold-500/15 p-2 text-gold-700">
                    <item.icon size={18} />
                  </span>
                  <span className="text-royal-800">{item.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <LinkButton href="/plan-your-visit#reserve" variant="primary">
                <Ticket size={18} /> Plan Your Visit
              </LinkButton>
            </div>
          </div>

          {/* Photo: the bronze laver in the courtyard */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-linen-200 shadow-xl">
              <Image
                src="/tabernacle-hero.jpg"
                alt="The bronze laver filled with water in the Tabernacle courtyard, before the curtained tent of meeting at dusk."
                width={1610}
                height={1072}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-linen-200 bg-white px-5 py-3 shadow-lg sm:block">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-700">The bronze laver</p>
              <p className="font-display text-lg font-semibold text-royal-900">Washing before service</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Learning preview ──────────────────────────────────── */}
      <section className="bg-linen-100 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            center
            eyebrow="Before You Come"
            title="Discover what it all means"
            subtitle="Free learning guides and a short video series prepare you to see Christ in every part of the Tabernacle."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {learningGuides.slice(0, 3).map((g) => (
              <div key={g.title} className="rounded-2xl border border-linen-200 bg-linen-50 p-6">
                <BookOpen className="text-gold-700" size={22} />
                <h3 className="mt-4 text-xl font-semibold text-royal-900">{g.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{g.summary}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <LinkButton href="/learn-more" variant="outline">
              View all learning guides
            </LinkButton>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="border-t border-linen-200 bg-linen-50 py-20 text-center sm:py-24">
        <div className="mx-auto max-w-3xl px-5">
          <span className="gold-rule" />
          <h2 className="mt-5 text-3xl font-semibold text-royal-900 sm:text-4xl">Come and see.</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Reserve a free guided tour during {site.season}. Bring your family, your congregation, or
            simply your curiosity.
          </p>
          <div className="mt-8">
            <LinkButton href="/plan-your-visit#reserve" variant="primary">
              <Ticket size={18} /> Reserve Your Tour
            </LinkButton>
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
            <MapPin size={15} className="text-gold-700" /> {fullAddress()}
          </p>
        </div>
      </section>
    </>
  );
}
