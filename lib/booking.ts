// Date/time helpers shared by the booking flow, admin, and emails.
// Tour dates/times are stored as plain DATE/TIME (no timezone) and formatted
// as-is so what staff schedule is exactly what visitors see.

export function formatTime(time: string): string {
  // time is "HH:MM:SS" or "HH:MM"
  const [hStr, mStr] = time.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return m === "00" ? `${h} ${period}` : `${h}:${m} ${period}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

// Parse "YYYY-MM-DD" into a local Date without timezone drift.
export function parseDateOnly(date: string): Date {
  const [y, m, d] = date.split("-").map((n) => parseInt(n, 10));
  return new Date(y, m - 1, d);
}

export function formatDateLong(date: string): string {
  return parseDateOnly(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(date: string): string {
  return parseDateOnly(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function weekdayName(date: string): string {
  return parseDateOnly(date).toLocaleDateString("en-US", { weekday: "long" });
}

// ── Slot generation (used by the admin generator) ─────────────────────
export interface GenerateSlotsInput {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  // 0 = Sunday … 6 = Saturday. Empty array = every day in range.
  weekdays: number[];
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM" (last tour must START before this)
  intervalMinutes: number; // gap between tour start times
  durationMinutes: number; // length of each tour
  capacity: number;
}

export interface GeneratedSlot {
  slot_date: string;
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  capacity: number;
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  return h * 60 + m;
}

function toTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

// Pure function: expand the admin's recurring rule into individual slots.
// Skips nothing here — the DB unique(slot_date, start_time) handles dedupe.
export function generateSlots(input: GenerateSlotsInput): GeneratedSlot[] {
  const slots: GeneratedSlot[] = [];
  const start = parseDateOnly(input.startDate);
  const end = parseDateOnly(input.endDate);
  const dayStart = toMinutes(input.startTime);
  const dayEnd = toMinutes(input.endTime);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (input.weekdays.length > 0 && !input.weekdays.includes(d.getDay())) continue;
    const date = isoDate(d);
    for (let t = dayStart; t <= dayEnd - input.durationMinutes; t += input.intervalMinutes) {
      slots.push({
        slot_date: date,
        start_time: toTimeString(t),
        end_time: toTimeString(t + input.durationMinutes),
        capacity: input.capacity,
      });
    }
  }
  return slots;
}

export const WEEKDAYS = [
  { value: 0, short: "Sun", long: "Sunday" },
  { value: 1, short: "Mon", long: "Monday" },
  { value: 2, short: "Tue", long: "Tuesday" },
  { value: 3, short: "Wed", long: "Wednesday" },
  { value: 4, short: "Thu", long: "Thursday" },
  { value: 5, short: "Fri", long: "Friday" },
  { value: 6, short: "Sat", long: "Saturday" },
] as const;
