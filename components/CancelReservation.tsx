"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const inputClass =
  "w-full rounded-lg border border-linen-300 bg-linen-50 px-4 py-3 text-sm text-royal-900 outline-none transition-colors placeholder:text-slate-400 focus:border-gold-500";

export default function CancelReservation({ code }: { code: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "working" | "cancelled" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("working");
    setError("");
    const email = new FormData(e.currentTarget).get("email");

    try {
      const res = await fetch("/api/reservation/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Something went wrong.");
      setStatus("cancelled");
      router.refresh(); // re-render the server details so the status badge updates

    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "cancelled") {
    return (
      <div className="rounded-2xl border border-gold-500/30 bg-linen-50 p-8 text-center">
        <CheckCircle2 className="mx-auto text-gold-700" size={40} />
        <h2 className="mt-4 text-xl font-semibold text-royal-900">Reservation cancelled</h2>
        <p className="mt-2 text-sm text-slate-600">
          Your spot has been released. We hope to see you another time.
        </p>
        <a href="/plan-your-visit#reserve" className="mt-5 inline-block text-sm font-semibold text-gold-700 hover:text-gold-700">
          Book a different time →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-linen-200 bg-linen-50 p-6 sm:p-8">
      <p className="flex items-center gap-2 text-sm font-semibold text-royal-900">
        <Ticket size={16} className="text-gold-700" /> Confirmation {code}
      </p>
      <p className="mt-3 text-sm text-slate-600">
        To cancel this reservation, confirm the email address you booked with.
      </p>
      <div className="mt-4">
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-royal-800">Email</label>
        <input id="email" name="email" type="email" required className={inputClass} placeholder="you@example.com" />
      </div>

      {status === "error" && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-scarlet-600/10 px-4 py-3 text-sm text-scarlet-600">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}

      <div className="mt-5">
        <Button type="submit" variant="outline" disabled={status === "working"}>
          {status === "working" ? <Loader2 className="animate-spin" size={16} /> : null}
          {status === "working" ? "Cancelling…" : "Cancel my reservation"}
        </Button>
      </div>
    </form>
  );
}
