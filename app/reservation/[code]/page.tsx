import type { Metadata } from "next";
import Link from "next/link";
import CancelReservation from "@/components/CancelReservation";

export const metadata: Metadata = {
  title: "Manage Your Reservation",
  robots: { index: false },
};

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cleanCode = decodeURIComponent(code).toUpperCase();

  return (
    <section className="mx-auto max-w-xl px-5 py-20">
      <h1 className="text-3xl font-semibold text-royal-900">Manage your reservation</h1>
      <p className="mt-2 text-slate-600">
        Need to make a change? Cancel below and book a new time that works better.
      </p>
      <div className="mt-8">
        <CancelReservation code={cleanCode} />
      </div>
      <p className="mt-6 text-sm text-slate-600">
        Looking to reserve a tour?{" "}
        <Link href="/plan-your-visit#reserve" className="font-medium text-gold-700 hover:text-gold-700">
          Plan your visit →
        </Link>
      </p>
    </section>
  );
}
