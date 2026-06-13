export type SlotStatus = "open" | "closed";
export type ReservationStatus = "confirmed" | "cancelled";

export interface TourSlot {
  id: string;
  slot_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  capacity: number;
  notes: string | null;
  status: SlotStatus;
  created_at: string;
  updated_at: string;
}

// Row shape returned by the public `available_slots` view.
export interface AvailableSlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  notes: string | null;
  remaining: number;
}

export interface Reservation {
  id: string;
  slot_id: string;
  name: string;
  email: string;
  phone: string | null;
  party_size: number;
  status: ReservationStatus;
  confirmation_code: string;
  created_at: string;
}

// Informational/RSVP events (e.g. devotionals) from the public events table.
export interface CommunityEvent {
  id: string;
  title: string;
  event_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS — 00:00:00 means "time to be announced"
  end_time: string | null;
  location: string | null;
  description: string | null;
  rsvp_url: string | null;
  status: "active" | "cancelled";
}

// Return shape of the book_slot RPC.
export interface BookingResult {
  confirmation_code: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  // Set when booking again with an email that already had an upcoming
  // reservation — the previous one is auto-cancelled (a "reschedule").
  rescheduled_from_date: string | null;
  rescheduled_from_start: string | null;
  rescheduled_count: number;
}
