import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking",
};

export default function AdminBookingsPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold text-espresso">Booking</h1>
      <p className="text-sm text-espresso/70">
        Halaman kelola booking (lihat daftar, ubah status) belum dibuat — menyusul.
      </p>
    </div>
  );
}
