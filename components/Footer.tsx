"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Mail, CalendarDays } from "lucide-react";
import { site, fullAddress } from "@/lib/site";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-royal-800 bg-royal-900 text-linen-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-semibold text-linen-50">{site.name}</p>
          <p className="mt-1 text-sm italic text-gold-400">{site.tagline}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-300">
            A free, guided walk through a full-scale recreation of the ancient Tabernacle.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">Visit</p>
          <a href={site.mapUrl} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-slate-300 hover:text-linen-50">
            <MapPin size={16} className="mt-0.5 shrink-0 text-gold-400" />
            <span>{fullAddress()}</span>
          </a>
          <p className="flex items-start gap-2 text-slate-300">
            <CalendarDays size={16} className="mt-0.5 shrink-0 text-gold-400" />
            <span>Tours: {site.season}</span>
          </p>
          <a href={`mailto:${site.email}`} className="flex items-start gap-2 text-slate-300 hover:text-linen-50">
            <Mail size={16} className="mt-0.5 shrink-0 text-gold-400" />
            <span>{site.email}</span>
          </a>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">Explore</p>
          <Link href="/plan-your-visit" className="block text-slate-300 hover:text-linen-50">Reserve a Tour</Link>
          <Link href="/learn-more" className="block text-slate-300 hover:text-linen-50">Learn More</Link>
          <Link href="/contact" className="block text-slate-300 hover:text-linen-50">Contact Us</Link>
        </div>
      </div>
      <div className="border-t border-royal-800">
        <p className="mx-auto max-w-6xl px-5 py-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} {site.name}. All are welcome.
        </p>
      </div>
    </footer>
  );
}
