import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { sendRemindersFor } from "@/lib/reminders";

// Daily (early morning): email everyone whose tour is today.
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await sendRemindersFor("morning_of"));
  } catch (err) {
    console.error("cron reminders morning", err);
    return NextResponse.json({ error: "Query failed." }, { status: 500 });
  }
}
