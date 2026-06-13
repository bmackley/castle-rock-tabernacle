import { createClient } from "@supabase/supabase-js";
import { CalendarDays, Clock, MapPin, ArrowUpRight } from "lucide-react";
import { formatDateLong, formatTime } from "@/lib/booking";
import type { CommunityEvent } from "@/lib/types";

// Upcoming community events (e.g. the kick-off devotional) from the public
// events table. Uses a cookie-less anon client so pages using it can stay
// cached; renders nothing when there are no upcoming events or the DB is
// unreachable, so it's always safe to include.
async function getUpcomingEvents(): Promise<CommunityEvent[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("status", "active")
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(3);
    return (data ?? []) as CommunityEvent[];
  } catch {
    return [];
  }
}

export default async function UpcomingEvents() {
  const events = await getUpcomingEvents();
  if (events.length === 0) return null;

  return (
    <section className="bg-royal-900 py-14 sm:py-16">
      <div className="mx-auto max-w-5xl px-5">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-gold-400">
          Special Events
        </p>
        <div className="mt-8 space-y-6">
          {events.map((e) => {
            const tba = e.start_time.startsWith("00:00");
            return (
              <div
                key={e.id}
                className="flex flex-col gap-6 rounded-3xl border border-royal-700 bg-royal-800/60 p-7 sm:p-8 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="max-w-2xl">
                  <h2 className="font-display text-2xl font-semibold text-linen-50 sm:text-3xl">
                    {e.title}
                  </h2>
                  {e.description && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{e.description}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-linen-100">
                    <span className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-gold-400" />
                      {formatDateLong(e.event_date)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock size={16} className="text-gold-400" />
                      {tba
                        ? "Time to be announced"
                        : `${formatTime(e.start_time)}${e.end_time ? ` – ${formatTime(e.end_time)}` : ""}`}
                    </span>
                    {e.location && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.location)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 hover:text-gold-300"
                      >
                        <MapPin size={16} className="text-gold-400" />
                        {e.location}
                      </a>
                    )}
                  </div>
                </div>
                {e.rsvp_url ? (
                  <a
                    href={e.rsvp_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gold-500 px-7 py-3 text-sm font-semibold text-royal-900 shadow-sm transition-colors hover:bg-gold-600"
                  >
                    RSVP <ArrowUpRight size={16} />
                  </a>
                ) : (
                  <p className="text-sm font-medium text-gold-300 lg:shrink-0">
                    All are welcome, no reservation needed
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
