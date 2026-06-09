import type { NextRequest } from "next/server";

// Verifies a request came from Vercel Cron (or an authorized caller).
// Vercel sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set.
export function isAuthorizedCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed if not configured
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}
