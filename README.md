# Castle Rock Tabernacle

A faithful rebuild of [castlerocktabernacle.com](https://www.castlerocktabernacle.com/) — a marketing
site for a full-scale recreation of the ancient Tabernacle in Castle Rock, CO — with a **custom,
overbooking-safe tour reservation system** and a **staff admin dashboard**.

Built to run entirely on free tiers: **Next.js** on **Vercel (Hobby)**, **Postgres on Supabase
(Free)**, transactional email via **Resend (Free)**.

---

## Stack

| Layer | Choice |
|------|--------|
| Framework | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 (`@theme` tokens in `app/globals.css`) |
| Database / Auth | Supabase (Postgres + Auth) |
| Email | Resend |
| Hosting | Vercel (Hobby) + Vercel Cron |

Project conventions mirror the other apps in this workspace: `proxy.ts` (not `middleware.ts`),
`lib/supabase/{server,client,admin}.ts`, `@/*` path alias.

---

## Features

**Public site**
- Home, Learn More (the Learning Guides + "Messages of Christ" video series), Contact (Resend).
- `/plan-your-visit` — the booking flow: pick a date → pick a time (with live "spots left") → enter
  details → instant confirmation + email.
- `/reservation/[code]` — guests cancel with their confirmation code + email.

**Admin** (`/admin`, Supabase Auth, gated in `proxy.ts` + `getAdminUser()`)
- **Slot generator** — create a whole week of tour times from one rule (date range × days × time
  window × interval × capacity), with a live count preview.
- **Slots list** — open/close/delete slots, see booked-vs-capacity per slot.
- **Reservations** — search, filter by date, cancel (frees the spot), export CSV.

**Reliability**
- `book_slot` Postgres RPC locks the slot row and re-checks capacity in a transaction — two people
  racing for the last seat can't both win.
- Public users can only read aggregated availability (a view) and call the booking RPCs — never read
  reservation PII directly (RLS + grants).
- Daily Vercel crons: tour **reminders** (day-before email) and a **keep-alive** ping so the Supabase
  free project never pauses.

---

## Setup

### 1. Install
```bash
npm install
```

### 2. Create a Supabase project (free)
1. Make a new project at [supabase.com](https://supabase.com).
2. In the **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql) (creates tables, the
   `available_slots` view, the `book_slot` / `cancel_reservation` RPCs, RLS, and grants).
3. *(Optional)* run [`supabase/seed.sql`](supabase/seed.sql) to create the opening-week slots
   (June 21–28, 2026) — or just use the admin generator.
4. **Authentication → Providers**: keep Email on, and **turn OFF "Allow new users to sign up"**
   (this is a single-staff admin). Then **Authentication → Users → Add user** to create your admin
   account. Put that email in `ADMIN_EMAIL`.

### 3. Configure Resend (free)
- Get an API key at [resend.com](https://resend.com).
- Until you verify a domain, set `RESEND_FROM_EMAIL=onboarding@resend.dev` (works immediately).
- To send from `@castlerocktabernacle.com`, add the domain in Resend and set the DNS records.

### 4. Environment
Copy `.env.example` → `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=…           # Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=…
SUPABASE_SERVICE_ROLE_KEY=…          # keep secret — server only
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=you@example.com          # the only email allowed into /admin
RESEND_API_KEY=…
RESEND_FROM_EMAIL=onboarding@resend.dev
ADMIN_NOTIFY_EMAIL=you@example.com   # where new-reservation + contact emails go
CRON_SECRET=…                        # any long random string
```

### 5. Run
```bash
npm run dev      # http://localhost:3000
```

---

## Deploy to Vercel (free)
1. Push to GitHub, import into Vercel.
2. Add every variable from `.env.local` in **Project → Settings → Environment Variables**
   (set `NEXT_PUBLIC_APP_URL` to your real URL). Adding `CRON_SECRET` automatically secures the cron
   routes — Vercel sends it as the bearer token.
3. `vercel.json` registers two daily crons (reminders + keep-alive). On Hobby, crons run once/day.

### Free-tier notes
- **Vercel Hobby** is for non-commercial use — fine for a church/nonprofit exhibit.
- **Supabase Free** pauses a project after ~7 days of inactivity; the daily keep-alive cron prevents
  this. (500 MB DB is far more than this needs.)
- **Resend Free** = 3,000 emails/month, 100/day.

---

## Verifying it works

```bash
npm run build      # must be clean
```

End-to-end (after Supabase + env are set):
1. Sign in at `/admin/login` → **Tour Slots** → generate a week of slots.
2. On `/plan-your-visit`, book a slot → confirmation code shown, confirmation email sent, capacity
   decremented. The slot disappears from public availability once full.
3. **Overbooking test:** set a slot's capacity to 2 (admin), then try to book a party of 3 → rejected;
   book 2, then try 1 more → rejected ("Only 0 spot(s) remain…"). This is enforced by `book_slot`.
4. **Admin:** close a slot (vanishes from public availability), cancel a reservation (spot returns),
   **Export CSV**.

---

## Design & accessibility
- **White-based, WCAG-checked palette.** Body is white with warm linen section bands; deep royal-blue
  and gold are accents (never blue text on a blue field). Every text/background pair was verified with
  computed contrast ratios — all meet **WCAG AA**, most **AAA**. Dark surfaces (footer, the booking
  panel header, admin bar) use light text at 7–16:1. Tokens live in
  [`app/globals.css`](app/globals.css).
- **Hero image** (`public/tabernacle-hero.jpg`) was pulled from the original site (a professional
  Tabernacle photo) and recompressed (4 MB PNG → ~390 KB JPG; Next/Image optimizes further at serve
  time). ⚠️ **Confirm you have rights to this image** before going live — it appears to be licensed
  stock from the original site. To swap it, drop a new file at the same path (the `<Image>` is in
  [`app/page.tsx`](app/page.tsx)). The original site's other image was the web agency's logo
  ("MARBAM"), not the tabernacle's, so it was not used.

## Project layout
```
app/
  page.tsx                       Home
  learn-more/ contact/           Public content
  plan-your-visit/page.tsx       Booking flow (+ BookingWidget)
  reservation/[code]/            Manage/cancel a reservation
  admin/login/                   Staff sign-in
  admin/(dashboard)/             Gated admin: overview, slots, reservations
  api/
    reserve/                     Public booking → book_slot RPC + emails
    availability/                Public open-slot list (no PII)
    reservation/cancel/          Public cancel by code
    contact/                     Contact form → Resend
    admin/slots/                 Generate / open-close / delete slots
    admin/reservations/          Cancel + CSV export
    cron/{reminders,keepalive}/  Daily Vercel crons
components/        Nav, Footer, BookingWidget, admin/*, ui/*
lib/
  supabase/{server,client,admin,middleware}.ts
  email/resend.ts                Transactional emails
  booking.ts                     Date/time formatting + slot generation (pure)
  content.ts site.ts types.ts admin-auth.ts cron.ts
supabase/schema.sql seed.sql
```

To change org details (address, email, tour season), edit [`lib/site.ts`](lib/site.ts).
To change Learn More content, edit [`lib/content.ts`](lib/content.ts).
