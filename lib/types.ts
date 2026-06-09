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

// Return shape of the book_slot RPC.
export interface BookingResult {
  confirmation_code: string;
  slot_date: string;
  start_time: string;
  end_time: string;
}
