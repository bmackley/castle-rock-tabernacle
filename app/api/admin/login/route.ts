import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, getAdminPassword } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json().catch(() => ({}));
  const correct = getAdminPassword();

  if (!correct || password !== correct) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, correct, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return response;
}
