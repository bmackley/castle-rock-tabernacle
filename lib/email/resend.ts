import { Resend } from "resend";
import { site, fullAddress } from "@/lib/site";
import { formatDateLong, formatTime, formatTimeRange } from "@/lib/booking";
import { googleCalendarUrl, outlookCalendarUrl, buildIcs } from "@/lib/calendar";

export const resend = new Resend(process.env.RESEND_API_KEY!);

const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const SENDER = `${site.name} <${FROM}>`;
const ADMIN_TO = process.env.ADMIN_NOTIFY_EMAIL ?? "";
// Guest replies go to a real, monitored inbox — the from-address domain is
// send-only (no MX), so without this, replies would bounce.
const REPLY_TO = process.env.RESEND_REPLY_TO ?? (ADMIN_TO || undefined);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function shell(inner: string): string {
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:540px;margin:0 auto;color:#1a1a1a;">
    <div style="padding:32px 0 8px;text-align:center;">
      <p style="font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#9a7b3f;margin:0;font-weight:600;">${site.name}</p>
      <p style="font-size:13px;color:#8a8a8a;margin:4px 0 0;font-style:italic;">${site.tagline}</p>
    </div>
    <div style="padding:8px 8px 32px;">${inner}</div>
    <div style="border-top:1px solid #eee;padding:20px 8px;text-align:center;color:#9a9a9a;font-size:12px;line-height:1.6;">
      ${fullAddress()}<br/>
      <a href="${APP_URL}" style="color:#9a7b3f;text-decoration:none;">${APP_URL.replace(/^https?:\/\//, "")}</a>
    </div>
  </div>`;
}

interface ReservationEmailData {
  to: string;
  name: string;
  code: string;
  slotDate: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  partySize: number;
}

// → Visitor: "your spot is reserved"
export async function sendReservationConfirmation(data: ReservationEmailData) {
  const when = formatDateLong(data.slotDate);
  const time = formatTimeRange(data.startTime, data.endTime);

  const inner = `
    <h1 style="font-size:22px;margin:16px 0 8px;">You're reserved, ${data.name.split(" ")[0]} 🎟️</h1>
    <p style="font-size:15px;color:#444;line-height:1.6;margin:0 0 24px;">
      Thank you for reserving a guided walk through the Tabernacle. Here are your details:
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:15px;background:#faf7f0;border-radius:10px;overflow:hidden;">
      <tr><td style="padding:14px 18px;color:#8a7a55;">Date</td><td style="padding:14px 18px;font-weight:600;text-align:right;">${when}</td></tr>
      <tr><td style="padding:14px 18px;color:#8a7a55;border-top:1px solid #efe7d6;">Time</td><td style="padding:14px 18px;font-weight:600;text-align:right;border-top:1px solid #efe7d6;">${time}</td></tr>
      <tr><td style="padding:14px 18px;color:#8a7a55;border-top:1px solid #efe7d6;">Guests</td><td style="padding:14px 18px;font-weight:600;text-align:right;border-top:1px solid #efe7d6;">${data.partySize}</td></tr>
      <tr><td style="padding:14px 18px;color:#8a7a55;border-top:1px solid #efe7d6;">Confirmation</td><td style="padding:14px 18px;font-weight:700;text-align:right;border-top:1px solid #efe7d6;letter-spacing:0.05em;">${data.code}</td></tr>
    </table>
    <p style="font-size:14px;color:#444;line-height:1.6;margin:24px 0 8px;">
      <strong>Where:</strong> ${fullAddress()}
    </p>
    <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 8px;">
      Admission is free. Please arrive 10 minutes early. The tour lasts about 45 minutes and includes some walking and standing.
    </p>
    <p style="margin:20px 0 0;text-align:center;">
      <a href="${googleCalendarUrl({ slotDate: data.slotDate, startTime: data.startTime, endTime: data.endTime, code: data.code })}"
         style="display:inline-block;background:#b8923f;color:#161f3e;font-weight:600;font-size:14px;padding:10px 22px;border-radius:999px;text-decoration:none;margin:0 4px 8px;">
        Add to Google Calendar
      </a>
      <a href="${outlookCalendarUrl({ slotDate: data.slotDate, startTime: data.startTime, endTime: data.endTime, code: data.code })}"
         style="display:inline-block;background:#1e2a52;color:#f8f6f1;font-weight:600;font-size:14px;padding:10px 22px;border-radius:999px;text-decoration:none;margin:0 4px 8px;">
        Add to Outlook
      </a>
    </p>
    <p style="font-size:12px;color:#999;text-align:center;margin:8px 0 0;">
      Using Apple Calendar? Open the attached invite.
    </p>
    <p style="font-size:13px;color:#999;line-height:1.6;margin:16px 0 0;">
      Need to cancel or change your party size?
      <a href="${APP_URL}/reservation/${data.code}" style="color:#9a7b3f;">Manage your reservation →</a>
    </p>`;

  const { error } = await resend.emails.send({
    from: SENDER,
    to: data.to,
    replyTo: REPLY_TO,
    subject: `Reserved: Tabernacle tour on ${when}`,
    html: shell(inner),
    attachments: [
      {
        filename: "tabernacle-tour.ics",
        content: Buffer.from(
          buildIcs({ slotDate: data.slotDate, startTime: data.startTime, endTime: data.endTime, code: data.code })
        ),
        contentType: "text/calendar",
      },
    ],
  });
  if (error) throw new Error(error.message);
}

// → Admin: a new reservation came in
export async function sendAdminNewReservation(data: ReservationEmailData & { phone: string | null }) {
  if (!ADMIN_TO) return;
  const when = formatDateLong(data.slotDate);
  const time = formatTimeRange(data.startTime, data.endTime);

  const inner = `
    <h1 style="font-size:20px;margin:16px 0 16px;">New tour reservation</h1>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#888;width:90px;">Guest</td><td style="padding:8px 0;font-weight:600;">${data.name}</td></tr>
      <tr><td style="padding:8px 0;color:#888;">Email</td><td style="padding:8px 0;"><a href="mailto:${data.to}" style="color:#9a7b3f;">${data.to}</a></td></tr>
      ${data.phone ? `<tr><td style="padding:8px 0;color:#888;">Phone</td><td style="padding:8px 0;">${data.phone}</td></tr>` : ""}
      <tr><td style="padding:8px 0;color:#888;">When</td><td style="padding:8px 0;">${when} · ${time}</td></tr>
      <tr><td style="padding:8px 0;color:#888;">Party</td><td style="padding:8px 0;">${data.partySize}</td></tr>
      <tr><td style="padding:8px 0;color:#888;">Code</td><td style="padding:8px 0;font-weight:700;">${data.code}</td></tr>
    </table>
    <p style="margin:20px 0 0;"><a href="${APP_URL}/admin/reservations" style="color:#9a7b3f;font-size:14px;">View all reservations →</a></p>`;

  await resend.emails
    .send({ from: SENDER, to: ADMIN_TO, replyTo: data.to, subject: `New reservation — ${data.name} (${when})`, html: shell(inner) })
    .catch(() => {}); // non-blocking
}

// → Visitor: reminder the day before
export async function sendTourReminder(data: ReservationEmailData) {
  const when = formatDateLong(data.slotDate);
  const time = formatTimeRange(data.startTime, data.endTime);
  const inner = `
    <h1 style="font-size:22px;margin:16px 0 8px;">See you tomorrow 👋</h1>
    <p style="font-size:15px;color:#444;line-height:1.6;margin:0 0 16px;">
      This is a friendly reminder of your Tabernacle tour:
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:15px;background:#faf7f0;border-radius:10px;overflow:hidden;">
      <tr><td style="padding:14px 18px;color:#8a7a55;">When</td><td style="padding:14px 18px;font-weight:600;text-align:right;">${when}<br/>${time}</td></tr>
      <tr><td style="padding:14px 18px;color:#8a7a55;border-top:1px solid #efe7d6;">Guests</td><td style="padding:14px 18px;font-weight:600;text-align:right;border-top:1px solid #efe7d6;">${data.partySize}</td></tr>
      <tr><td style="padding:14px 18px;color:#8a7a55;border-top:1px solid #efe7d6;">Where</td><td style="padding:14px 18px;font-weight:600;text-align:right;border-top:1px solid #efe7d6;">${fullAddress()}</td></tr>
    </table>
    <p style="font-size:13px;color:#999;line-height:1.6;margin:16px 0 0;">
      Confirmation ${data.code}. Please arrive 10 minutes early.
      <a href="${APP_URL}/reservation/${data.code}" style="color:#9a7b3f;">Can't make it? Cancel here →</a>
    </p>`;
  await resend.emails
    .send({ from: SENDER, to: data.to, replyTo: REPLY_TO, subject: `Reminder: your Tabernacle tour is tomorrow`, html: shell(inner) })
    .catch(() => {});
}

// → Visitor: the morning of their tour
export async function sendTourMorningReminder(data: ReservationEmailData) {
  const time = formatTimeRange(data.startTime, data.endTime);
  const inner = `
    <h1 style="font-size:22px;margin:16px 0 8px;">Your tour is today 🌅</h1>
    <p style="font-size:15px;color:#444;line-height:1.6;margin:0 0 16px;">
      Good morning, ${data.name.split(" ")[0]}! We're looking forward to welcoming you at the Tabernacle today.
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:15px;background:#faf7f0;border-radius:10px;overflow:hidden;">
      <tr><td style="padding:14px 18px;color:#8a7a55;">Time</td><td style="padding:14px 18px;font-weight:600;text-align:right;">${time}</td></tr>
      <tr><td style="padding:14px 18px;color:#8a7a55;border-top:1px solid #efe7d6;">Guests</td><td style="padding:14px 18px;font-weight:600;text-align:right;border-top:1px solid #efe7d6;">${data.partySize}</td></tr>
      <tr><td style="padding:14px 18px;color:#8a7a55;border-top:1px solid #efe7d6;">Where</td><td style="padding:14px 18px;font-weight:600;text-align:right;border-top:1px solid #efe7d6;">${fullAddress()}</td></tr>
    </table>
    <p style="font-size:14px;color:#666;line-height:1.6;margin:16px 0 0;">
      Please arrive 10 minutes early so your group can begin together. Free parking is available on site.
      <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress())}" style="color:#9a7b3f;">Get directions →</a>
    </p>
    <p style="font-size:13px;color:#999;line-height:1.6;margin:16px 0 0;">
      Confirmation ${data.code}.
      <a href="${APP_URL}/reservation/${data.code}" style="color:#9a7b3f;">Can't make it? Cancel here →</a>
    </p>`;
  await resend.emails
    .send({
      from: SENDER,
      to: data.to,
      replyTo: REPLY_TO,
      subject: `Today: your Tabernacle tour at ${formatTime(data.startTime)}`,
      html: shell(inner),
    })
    .catch(() => {});
}

// → Admin: contact form submission
export async function sendContactNotification(data: {
  name: string;
  email: string;
  message: string;
}) {
  if (!ADMIN_TO) return;
  const inner = `
    <h1 style="font-size:20px;margin:16px 0 16px;">New message from the website</h1>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
      <tr><td style="padding:8px 0;color:#888;width:70px;">Name</td><td style="padding:8px 0;font-weight:600;">${data.name}</td></tr>
      <tr><td style="padding:8px 0;color:#888;">Email</td><td style="padding:8px 0;"><a href="mailto:${data.email}" style="color:#9a7b3f;">${data.email}</a></td></tr>
    </table>
    <div style="background:#faf7f0;border-radius:10px;padding:16px 18px;font-size:15px;line-height:1.6;color:#1a1a1a;">
      ${data.message.replace(/\n/g, "<br>")}
    </div>`;
  const { error } = await resend.emails.send({
    from: SENDER,
    to: ADMIN_TO,
    replyTo: data.email,
    subject: `Website message from ${data.name}`,
    html: shell(inner),
  });
  if (error) throw new Error(error.message);
}
