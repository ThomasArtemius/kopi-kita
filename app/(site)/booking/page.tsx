import type { Metadata } from "next";
import BookingForm from "@/components/booking-form";

export const metadata: Metadata = {
  title: "Booking Meja",
  description:
    "Booking meja di Kopi Kita — isi form untuk mengamankan tempatmu.",
};

export default function BookingPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
      <div className="mb-10 flex flex-col gap-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-espresso">
          Booking Meja
        </h1>
        <p className="text-espresso/70">
          Amankan meja favoritmu di Kopi Kita — isi form di bawah ini.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        <BookingForm />
      </div>
    </main>
  );
}
