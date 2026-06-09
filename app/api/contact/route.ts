import { NextResponse, type NextRequest } from "next/server";
import { sendContactNotification } from "@/lib/email/resend";

export async function POST(request: NextRequest) {
  let body: { name?: string; email?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Please fill in every field." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    await sendContactNotification({ name, email, message });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact POST", err);
    return NextResponse.json(
      { error: "We couldn't send your message right now. Please email us directly." },
      { status: 500 }
    );
  }
}
