import type { Metadata } from "next";
import { Download } from "lucide-react";

export const metadata: Metadata = { title: "Check-In SOP", robots: { index: false } };

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-linen-200 pt-8">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-royal-900 text-xs font-bold text-linen-50">
          {number}
        </span>
        <h2 className="text-lg font-semibold text-royal-900">{title}</h2>
      </div>
      <div className="pl-10 space-y-2">{children}</div>
    </section>
  );
}

function Step({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-sm text-slate-700">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
      <p>{children}</p>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 rounded-xl bg-linen-200/60 px-4 py-3 text-sm text-slate-600 italic">{children}</p>
  );
}

export default function SopPage() {
  return (
    <div className="min-h-screen bg-linen-100">
      <div className="mx-auto max-w-2xl px-5 py-12">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-700">Volunteer Guide</p>
          <h1 className="mt-2 text-3xl font-semibold text-royal-900">Tour Check-In SOP</h1>
          <p className="mt-1 text-sm text-slate-500">Castle Rock Tabernacle · June 21–28, 2026</p>
          <a
            href="/volunteer-checkin-sop.docx"
            download
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-linen-300 bg-linen-50 px-4 py-2 text-sm font-medium text-royal-800 hover:border-gold-500 hover:text-gold-700"
          >
            <Download size={15} /> Download as Word doc
          </a>
        </div>

        {/* Overview */}
        <div className="mb-8 rounded-2xl border border-linen-200 bg-linen-50 px-6 py-5 text-sm text-slate-700 space-y-2">
          <p>
            This tool is used by volunteers at the entrance to verify reservations, check guests in,
            log walk-ins, and make quick changes when needed.
          </p>
          <p>
            Access it at{" "}
            <span className="font-semibold text-royal-900">castlerocktabernacle.com/checkin</span>{" "}
            on any device. No login required. The page refreshes automatically every 60 seconds.
          </p>
        </div>

        <div className="space-y-8">

          {/* Section 1 */}
          <Section number="1" title="Starting Your Shift">
            <Step>Open the check-in page on your phone, tablet, or laptop.</Step>
            <Step>Today's tour slots appear as tabs across the top of the page.</Step>
            <Step>The current or next upcoming slot is highlighted automatically.</Step>
            <Step>Verify the date shown matches today before checking anyone in.</Step>
          </Section>

          {/* Section 2 */}
          <Section number="2" title="Checking In a Guest with a Reservation">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Using the slot list</p>
            <Step>Tap the time slot tab that matches the tour the guest is joining.</Step>
            <Step>Find their name in the list and tap the <strong>circle button (○)</strong> to check them in — it turns green with a checkmark.</Step>
            <Step>To undo a check-in, tap the green checkmark again.</Step>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mt-4 mb-1">Using search</p>
            <Step>Type the guest's name, email, or confirmation code (e.g. <span className="font-mono">CRT-8FK2A</span>) into the search bar.</Step>
            <Step>Results appear instantly — tap <strong>Check in</strong> next to the correct result.</Step>
            <Step>Search works across all days, useful if a guest isn't sure which day they booked.</Step>
          </Section>

          {/* Section 3 */}
          <Section number="3" title="Logging a Walk-In Guest">
            <Step>Tap the <strong>Walk-in</strong> button in the top-right corner of the page.</Step>
            <Step>Select the tour time from the dropdown — it defaults to the current or next upcoming slot.</Step>
            <Step>Enter the guest's <strong>Name</strong> (required) and <strong>Party size</strong>.</Step>
            <Step>Optionally add their <strong>Email</strong> and <strong>Phone</strong> for future communication.</Step>
            <Step>Tap <strong>Log walk-in</strong>. The guest is saved and automatically marked checked in.</Step>
            <Note>Walk-ins are always welcome. Reservations receive priority — if a slot is full, walk-ins may need to wait for the next tour.</Note>
          </Section>

          {/* Section 4 */}
          <Section number="4" title="Making Changes to a Reservation">
            <Step>Search for the guest by name, email, or confirmation code.</Step>
            <Step>Tap <strong>Manage / Cancel →</strong> beneath their name in the search results.</Step>
            <Step>Their reservation page opens in a new tab where you can cancel or view full details.</Step>
            <Note>For tour time changes, the guest can re-book at castlerocktabernacle.com with the same email address and their old reservation will be freed up.</Note>
          </Section>

          {/* Section 5 */}
          <Section number="5" title="Guest Can't Be Found">
            <Step>Ask for their confirmation code (format: <span className="font-mono">CRT-XXXXX</span>) and search by that.</Step>
            <Step>Check if they may have booked under a different name or email.</Step>
            <Step>If still not found and space is available in the slot, log them as a walk-in.</Step>
            <Step>Do not turn guests away without checking with a lead volunteer first.</Step>
          </Section>

          {/* Quick reference */}
          <section className="border-t border-linen-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-royal-900">Quick Reference</h2>
            <div className="overflow-hidden rounded-2xl border border-linen-200 bg-linen-50">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-linen-100">
                  {[
                    ["○  (empty circle)", "Not checked in — tap to check in"],
                    ["✓  (green circle)", "Checked in — tap again to undo"],
                    ["Walk-in button", "Log a guest without a reservation"],
                    ["Manage / Cancel →", "Open reservation page to make changes"],
                    ["Search bar", "Find any guest by name, email, or code"],
                  ].map(([term, def]) => (
                    <tr key={term}>
                      <td className="px-4 py-3 font-medium text-royal-900 whitespace-nowrap">{term}</td>
                      <td className="px-4 py-3 text-slate-600">{def}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* Footer */}
        <p className="mt-12 text-center text-xs text-slate-400">
          Questions? Find a lead volunteer or visit castlerocktabernacle.com
        </p>

      </div>
    </div>
  );
}
