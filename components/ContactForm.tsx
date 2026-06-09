"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const inputClass =
  "w-full rounded-lg border border-linen-300 bg-linen-50 px-4 py-3 text-sm text-royal-900 outline-none transition-colors placeholder:text-slate-400 focus:border-gold-500";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong. Please try again.");
      }
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-gold-500/30 bg-linen-50 p-8 text-center">
        <CheckCircle2 className="mx-auto text-gold-700" size={40} />
        <h3 className="mt-4 text-xl font-semibold text-royal-900">Message sent</h3>
        <p className="mt-2 text-sm text-slate-600">
          Thank you for reaching out. We&apos;ll get back to you as soon as we can.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-5 text-sm font-medium text-gold-700 hover:text-gold-700"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-linen-200 bg-linen-50 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-royal-800">Name</label>
          <input id="name" name="name" required className={inputClass} placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-royal-800">Email</label>
          <input id="email" name="email" type="email" required className={inputClass} placeholder="you@example.com" />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-royal-800">Message</label>
        <textarea id="message" name="message" required rows={5} className={inputClass} placeholder="How can we help? Questions about group tours are welcome." />
      </div>

      {status === "error" && (
        <p className="rounded-lg bg-scarlet-600/10 px-4 py-3 text-sm text-scarlet-600">{error}</p>
      )}

      <Button type="submit" variant="primary" disabled={status === "sending"}>
        <Send size={16} /> {status === "sending" ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
