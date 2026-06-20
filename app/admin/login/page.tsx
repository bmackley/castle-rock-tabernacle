"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, AlertCircle } from "lucide-react";
import { site } from "@/lib/site";

const inputClass =
  "w-full rounded-lg border border-linen-300 bg-linen-50 px-4 py-3 text-sm text-royal-900 outline-none transition-colors placeholder:text-slate-400 focus:border-gold-500";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(e.currentTarget);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: data.get("password") }),
    });

    if (!res.ok) {
      setError("Incorrect password.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-royal-900 px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl font-semibold text-linen-50">{site.name}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gold-400">Staff Admin</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-linen-50 p-6 shadow-xl sm:p-8">
          <p className="flex items-center gap-2 text-sm font-semibold text-royal-900">
            <Lock size={16} className="text-gold-700" /> Enter password
          </p>
          <div>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              autoFocus
              placeholder="Password"
              className={inputClass}
            />
          </div>

          {error && (
            <p className="flex items-start gap-2 rounded-lg bg-scarlet-600/10 px-4 py-3 text-sm text-scarlet-600">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-royal-900 py-3 text-sm font-semibold text-linen-50 hover:bg-royal-800 disabled:opacity-60"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
