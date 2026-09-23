"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface SummaryState {
  productCount: number | null;
  pendingBookingCount: number | null;
  loading: boolean;
  error: string | null;
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<SummaryState>({
    productCount: null,
    pendingBookingCount: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [productsRes, bookingsRes] = await Promise.all([
          apiFetch("/api/products"),
          apiFetch("/api/bookings"),
        ]);

        if (!productsRes.ok || !bookingsRes.ok) {
          throw new Error("Gagal memuat ringkasan");
        }

        const products: unknown[] = await productsRes.json();
        const bookings: { status: string }[] = await bookingsRes.json();
        const pendingCount = bookings.filter((b) => b.status === "pending").length;

        if (!cancelled) {
          setSummary({
            productCount: products.length,
            pendingBookingCount: pendingCount,
            loading: false,
            error: null,
          });
        }
      } catch {
        if (!cancelled) {
          setSummary((prev) => ({
            ...prev,
            loading: false,
            error: "Gagal memuat ringkasan dari server.",
          }));
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-espresso">Ringkasan</h1>
        <p className="text-sm text-espresso/70">Gambaran singkat data Kopi Kita.</p>
      </div>

      {summary.error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600" role="alert">
          {summary.error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-espresso/10 bg-white/70 p-6">
          <p className="text-sm text-espresso/60">Jumlah Produk</p>
          <p className="mt-2 text-3xl font-bold text-espresso">
            {summary.loading ? "…" : summary.productCount}
          </p>
        </div>
        <div className="rounded-2xl border border-espresso/10 bg-white/70 p-6">
          <p className="text-sm text-espresso/60">Booking Pending</p>
          <p className="mt-2 text-3xl font-bold text-accent">
            {summary.loading ? "…" : summary.pendingBookingCount}
          </p>
        </div>
      </div>
    </div>
  );
}
