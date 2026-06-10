"use client";

import { CalendarPlus, CalendarDays, CalendarCheck } from "lucide-react";
import { googleCalendarUrl, outlookCalendarUrl, buildIcs, type CalendarEventInput } from "@/lib/calendar";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-linen-300 bg-white px-5 py-2.5 text-sm font-semibold text-royal-800 transition-colors hover:border-gold-500 hover:text-gold-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500";

export default function AddToCalendar({ event }: { event: CalendarEventInput }) {
  function downloadIcs() {
    const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tabernacle-tour.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer" className={buttonClass}>
        <CalendarPlus size={16} className="text-gold-700" /> Google
      </a>
      <a href={outlookCalendarUrl(event)} target="_blank" rel="noreferrer" className={buttonClass}>
        <CalendarCheck size={16} className="text-gold-700" /> Outlook
      </a>
      <button type="button" onClick={downloadIcs} className={buttonClass}>
        <CalendarDays size={16} className="text-gold-700" /> Apple (.ics)
      </button>
    </div>
  );
}
