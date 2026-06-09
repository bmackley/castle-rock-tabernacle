import type { Metadata } from "next";
import { MapPin, Mail, CalendarDays } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { site, fullAddress } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Questions about visiting the Castle Rock Tabernacle, group tours, or the exhibit? Get in touch.",
};

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-linen-200 bg-linen-50 py-14 text-center sm:py-16">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-700">Contact Us</p>
          <h1 className="mt-4 text-4xl font-semibold text-royal-900 sm:text-5xl">We&apos;d love to hear from you</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Have a question about your visit or want to arrange a group tour? Send us a note.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-10 px-5 py-16 lg:grid-cols-5 sm:py-20">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-royal-900">Visit the Tabernacle</h2>
          <div className="mt-6 space-y-5 text-sm">
            <a href={site.mapUrl} target="_blank" rel="noreferrer" className="flex items-start gap-3 text-royal-800 hover:text-gold-700">
              <MapPin size={20} className="mt-0.5 shrink-0 text-gold-700" />
              <span>{fullAddress()}<br /><span className="text-slate-500">Get directions →</span></span>
            </a>
            <p className="flex items-start gap-3 text-royal-800">
              <CalendarDays size={20} className="mt-0.5 shrink-0 text-gold-700" />
              <span>Tours: {site.season}<br /><span className="text-slate-500">Free admission</span></span>
            </p>
            <a href={`mailto:${site.email}`} className="flex items-start gap-3 text-royal-800 hover:text-gold-700">
              <Mail size={20} className="mt-0.5 shrink-0 text-gold-700" />
              <span>{site.email}</span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
