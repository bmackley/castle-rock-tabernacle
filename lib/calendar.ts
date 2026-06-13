// Add-to-calendar helpers shared by the booking widget, the reservation page,
// and the confirmation email. Tour times are stored without a timezone and the
// event is in person, so we emit "floating" local times — calendars show the
// tour at the wall-clock time staff scheduled it.
import { site, fullAddress } from "@/lib/site";

export interface CalendarEventInput {
  slotDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM or HH:MM:SS
  endTime: string;
  code: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// "2026-06-21" + "10:00:00" → "20260621T100000"
function stamp(date: string, time: string): string {
  const [h = "00", m = "00"] = time.split(":");
  return `${date.replace(/-/g, "")}T${h.padStart(2, "0")}${m.padStart(2, "0")}00`;
}

function eventDetails(input: CalendarEventInput) {
  return {
    title: `Tabernacle Tour: ${site.name}`,
    description: `Free guided tour of the ${site.name}. Please arrive 10 minutes early.\n\nConfirmation: ${input.code}\nManage your reservation: ${APP_URL}/reservation/${input.code}`,
    location: fullAddress(),
    start: stamp(input.slotDate, input.startTime),
    end: stamp(input.slotDate, input.endTime),
  };
}

export function googleCalendarUrl(input: CalendarEventInput): string {
  const e = eventDetails(input);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${e.start}/${e.end}`,
    details: e.description,
    location: e.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Outlook.com and Microsoft 365 share the same compose deep-link, which wants
// ISO-style local datetimes ("2026-06-21T10:00:00").
export function outlookCalendarUrl(input: CalendarEventInput): string {
  const e = eventDetails(input);
  const iso = (s: string) =>
    `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(9, 11)}:${s.slice(11, 13)}:00`;
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: e.title,
    startdt: iso(e.start),
    enddt: iso(e.end),
    body: e.description,
    location: e.location,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

// Works with Apple Calendar, Outlook, and anything else that opens .ics files.
export function buildIcs(input: CalendarEventInput): string {
  const e = eventDetails(input);
  const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${site.name}//Tour Reservation//EN`,
    "BEGIN:VEVENT",
    `UID:${input.code}@castlerocktabernacle`,
    `DTSTAMP:${e.start}`,
    `DTSTART:${e.start}`,
    `DTEND:${e.end}`,
    `SUMMARY:${escape(e.title)}`,
    `DESCRIPTION:${escape(e.description)}`,
    `LOCATION:${escape(e.location)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escape(e.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
