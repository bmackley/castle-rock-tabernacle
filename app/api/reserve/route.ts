import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendReservationConfirmation,
  sendReservationRescheduled,
  sendAdminNewReservation,
} from "@/lib/email/resend";
import type { BookingResult } from "@/lib/types";

export async function POST(request: NextRequest) {
  let body: {
    slotId?: string;
    name?: string;
    email?: string;
    phone?: string;
    partySize?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const slotId = body.slotId?.trim();
  const name = body.name?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim() ?? "";
  const partySize = Number(body.partySize);

  if (!slotId || !name || !email) {
    return NextResponse.json({ error: "Please complete every required field." }, { status: 400 });
  }
  if (!Number.isInteger(partySize) || partySize < 1 || partySize > 20) {
    return NextResponse.json({ error: "Please choose a party size between 1 and 20." }, { status: 400 });
  }

  // The book_slot RPC locks the slot and recomputes capacity atomically —
  // this is what prevents overbooking under concurrent requests.
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("book_slot", {
    p_slot_id: slotId,
    p_name: name,
    p_email: email,
    p_phone: phone,
    p_party_size: partySize,
  });

  if (error) {
    // The RPC raises user-friendly messages (e.g. "Only 2 spot(s) remain…").
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  const result = (Array.isArray(data) ? data[0] : data) as BookingResult | undefined;
  if (!result) {
    return NextResponse.json({ error: "We couldn't complete your reservation." }, { status: 500 });
  }

  const rescheduledFrom =
    result.rescheduled_from_date && result.rescheduled_from_start
      ? { date: result.rescheduled_from_date, startTime: result.rescheduled_from_start }
      : null;

  // Emails are best-effort: a failed send must not undo a confirmed booking.
  try {
    const emailData = {
      to: email,
      name,
      code: result.confirmation_code,
      slotDate: result.slot_date,
      startTime: result.start_time,
      endTime: result.end_time,
      partySize,
    };
    if (rescheduledFrom) {
      await sendReservationRescheduled({ ...emailData, from: rescheduledFrom });
    } else {
      await sendReservationConfirmation(emailData);
    }
    await sendAdminNewReservation({
      ...emailData,
      phone: phone || null,
      rescheduled: Boolean(rescheduledFrom),
    });
  } catch (err) {
    console.error("reserve email", err);
  }

  return NextResponse.json({
    code: result.confirmation_code,
    slotDate: result.slot_date,
    startTime: result.start_time,
    endTime: result.end_time,
    rescheduledFrom,
  });
}
