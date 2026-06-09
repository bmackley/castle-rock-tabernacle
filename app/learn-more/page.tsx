import type { Metadata } from "next";
import Image from "next/image";
import { BookOpen, PlayCircle, Ticket } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { LinkButton } from "@/components/ui/Button";
import { learningGuides, videoSeries } from "@/lib/content";

export const metadata: Metadata = {
  title: "Learn More",
  description:
    "Free learning guides and the Messages of Christ video series — how the ancient Tabernacle teaches us about Jesus Christ.",
};

export default function LearnMorePage() {
  return (
    <>
      <section className="border-b border-linen-200 bg-linen-50 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-700">Learn More</p>
          <h1 className="mt-4 text-4xl font-semibold text-royal-900 sm:text-5xl">Christ in the Ancient Tabernacle</h1>
          <span className="gold-rule mt-5" />
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            The Tabernacle's design, furnishings, and ordinances were given as symbols. Each one teaches
            us about the Savior. These free guides help you see Him before you ever step inside.
          </p>
        </div>
      </section>

      {/* Learning guides */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <SectionHeading
          eyebrow="Learning Guides"
          title="Seven guides to walk you through"
          subtitle="Read these on your own or with your family. Each one draws out the meaning of a part of the Tabernacle and how it points to Jesus Christ."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {learningGuides.map((g, i) => (
            <article
              key={g.slug}
              className="flex flex-col rounded-2xl border border-linen-200 bg-linen-50 p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500/15 text-sm font-semibold text-gold-700">
                  {i + 1}
                </span>
                <BookOpen className="text-gold-700" size={20} />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-royal-900">{g.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{g.summary}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Ark of the Covenant feature */}
      <section className="border-y border-linen-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:py-20 lg:grid-cols-2">
          <div className="order-2 overflow-hidden rounded-3xl border border-linen-200 shadow-xl lg:order-1">
            <Image
              src="/ark-of-the-covenant.jpg"
              alt="The Ark of the Covenant — a gold chest overlaid with two cherubim facing one another above the mercy seat, set behind the veil."
              width={1612}
              height={1072}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-700">The Holy of Holies</p>
            <h2 className="mt-3 text-3xl font-semibold text-royal-900 sm:text-4xl">Behind the veil</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              At the heart of the Tabernacle stood the ark of the covenant, overshadowed by two
              cherubim above the mercy seat — the meeting place of God and man. The veil that
              concealed it was torn at the Savior&apos;s death, opening the way into His presence.
              Here the whole pattern finds its purpose: Christ, our great High Priest.
            </p>
            <div className="mt-7">
              <LinkButton href="/plan-your-visit#reserve" variant="primary">
                <Ticket size={18} /> Reserve a Tour
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* Video series */}
      <section className="bg-linen-100 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            eyebrow="Video Series"
            title={videoSeries.title}
            subtitle={videoSeries.intro}
          />
          <p className="mt-2 text-sm text-slate-600">Narrated by {videoSeries.narrator}</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {videoSeries.episodes.map((ep) => (
              <article key={ep.title} className="overflow-hidden rounded-2xl border border-linen-200 bg-linen-50">
                <div className="flex aspect-video items-center justify-center bg-royal-800">
                  <PlayCircle className="text-gold-400" size={44} />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-royal-900">{ep.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{ep.description}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-500">
            Video links can be added in <code className="rounded bg-linen-200 px-1.5 py-0.5">lib/content.ts</code> once hosting is chosen.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h2 className="text-3xl font-semibold text-royal-900">Ready to experience it in person?</h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          Reserve a free guided tour and walk through the Tabernacle for yourself.
        </p>
        <div className="mt-8">
          <LinkButton href="/plan-your-visit#reserve" variant="primary">
            <Ticket size={18} /> Reserve a Tour
          </LinkButton>
        </div>
      </section>
    </>
  );
}
