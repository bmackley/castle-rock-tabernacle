import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Public: cancel a reservation with its confirmation code + matching email.
export async function POST(request: NextRequest) {
  let body: { code?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const code = body.code?.trim();
  const email = body.email?.trim();
  if (!code || !email) {
    return NextResponse.json({ error: "Confirmation code and email are required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("cancel_reservation", {
    p_code: code,
    p_email: email,
  });

  if (error) {
    console.error("cancel POST", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
  if (data !== true) {
    return NextResponse.json(
      { error: "We couldn't find an active reservation matching that code and email." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
