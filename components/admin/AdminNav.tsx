"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarClock, Users, ExternalLink } from "lucide-react";
import { site } from "@/lib/site";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/slots", label: "Tour Slots", icon: CalendarClock },
  { href: "/admin/reservations", label: "Reservations", icon: Users },
];

export default function AdminNav({ email: _ }: { email: string | null }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-royal-800 bg-royal-900 text-linen-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-display text-lg font-semibold">
            {site.name} <span className="text-gold-400">Admin</span>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((l) => {
              const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active ? "bg-royal-800 text-gold-300" : "text-slate-300 hover:text-linen-50"
                  }`}
                >
                  <l.icon size={15} /> {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <Link href="/" target="_blank" className="hidden items-center gap-1 text-sm text-slate-300 hover:text-linen-50 sm:flex">
          View site <ExternalLink size={13} />
        </Link>
      </div>
    </header>
  );
}
