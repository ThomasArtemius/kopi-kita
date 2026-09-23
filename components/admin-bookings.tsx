"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatShortDate } from "@/lib/format";
import {
  BOOKING_STATUSES,
  BOOKING_STATUS_BADGE,
  BOOKING_STATUS_LABEL,
  type AdminBooking,
  type BookingStatus,
} from "@/lib/types";

type FilterKey = "semua" | BookingStatus;

const tabs: { key: FilterKey; label: string }[] = [
  { key: "semua", label: "Semua" },
  ...BOOKING_STATUSES.map((status) => ({ key: status, label: BOOKING_STATUS_LABEL[status] })),
];

async function fetchBookingList(): Promise<AdminBooking[]> {
  const res = await apiFetch("/api/bookings");
  if (!res.ok) throw new Error("Gagal memuat daftar booking.");
  return res.json();
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterKey>("semua");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // setState di sini dipanggil dari .then/.catch/.finally, bukan sinkron
  // di badan efek, supaya tidak kena cascading render.
  useEffect(() => {
    let cancelled = false;

    fetchBookingList()
      .then((data) => {
        if (!cancelled) setBookings(data);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat daftar booking.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleChangeStatus(booking: AdminBooking, status: BookingStatus) {
    setUpdatingId(booking.id);
    setError(null);
    try {
      const res = await apiFetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const updated: AdminBooking = await res.json();
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch {
      setError("Gagal mengubah status booking.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredBookings =
    activeTab === "semua" ? bookings : bookings.filter((b) => b.status === activeTab);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-espresso">Booking</h1>
        <p className="text-sm text-espresso/70">
          Daftar booking meja, urut dari tanggal terdekat.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            aria-pressed={activeTab === tab.key}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? "bg-espresso text-cream"
                : "border border-espresso/10 bg-white/60 text-espresso/70 hover:bg-accent/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-espresso/10 bg-white/70">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-espresso/10 text-xs uppercase tracking-wide text-espresso/50">
              <th className="px-4 py-3 font-semibold">Nama</th>
              <th className="px-4 py-3 font-semibold">WhatsApp</th>
              <th className="px-4 py-3 font-semibold">Tanggal</th>
              <th className="px-4 py-3 font-semibold">Jam</th>
              <th className="px-4 py-3 font-semibold">Orang</th>
              <th className="px-4 py-3 font-semibold">Catatan</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-espresso/10">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-espresso/50">
                  Memuat booking...
                </td>
              </tr>
            ) : filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-espresso/50">
                  Belum ada booking.
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-4 py-3 font-medium text-espresso">
                    {booking.customer_name}
                  </td>
                  <td className="px-4 py-3 text-espresso/70">{booking.whatsapp}</td>
                  <td className="px-4 py-3 text-espresso/70">
                    {formatShortDate(booking.booking_date)}
                  </td>
                  <td className="px-4 py-3 text-espresso/70">{booking.booking_time}</td>
                  <td className="px-4 py-3 text-espresso/70">{booking.party_size}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-espresso/70">
                    {booking.notes || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${BOOKING_STATUS_BADGE[booking.status]}`}
                    >
                      {BOOKING_STATUS_LABEL[booking.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {BOOKING_STATUSES.filter((status) => status !== booking.status).map(
                        (status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={updatingId === booking.id}
                            onClick={() => handleChangeStatus(booking, status)}
                            className="rounded-full border border-espresso/15 px-3 py-1 text-xs font-semibold text-espresso transition-colors hover:bg-espresso/5 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {BOOKING_STATUS_LABEL[status]}
                          </button>
                        ),
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
