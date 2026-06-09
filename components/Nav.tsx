"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { site } from "@/lib/site";

const links = [
  { href: "/", label: "Home" },
  { href: "/plan-your-visit", label: "Plan Your Visit" },
  { href: "/learn-more", label: "Learn More" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // The admin area has its own chrome — hide the public nav there.
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-linen-200 bg-linen-50/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="group flex flex-col leading-none" onClick={() => setOpen(false)}>
          <span className="font-display text-xl font-semibold tracking-wide text-royal-800">
            {site.name}
          </span>
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold-700">
            {site.tagline}
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors hover:text-gold-700 ${
                  active ? "text-gold-700" : "text-royal-700"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/plan-your-visit#reserve"
            className="rounded-full bg-royal-800 px-5 py-2 text-sm font-semibold text-linen-50 shadow-sm transition-colors hover:bg-royal-900"
          >
            Reserve a Tour
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-md p-1.5 text-royal-800 md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-linen-200 bg-linen-50 md:hidden">
          <div className="flex flex-col px-5 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium text-royal-700"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/plan-your-visit#reserve"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-royal-800 px-5 py-2.5 text-center text-sm font-semibold text-linen-50"
            >
              Reserve a Tour
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
