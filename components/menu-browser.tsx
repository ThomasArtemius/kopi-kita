"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/product-card";
import { apiFetch } from "@/lib/api";
import type { MenuCategory, MenuItem } from "@/lib/menu-data";
import type { AdminProduct } from "@/lib/types";

type FilterKey = "semua" | MenuCategory;

const tabs: { key: FilterKey; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "kopi", label: "Kopi" },
  { key: "non-kopi", label: "Non-Kopi" },
  { key: "pastry", label: "Pastry" },
];

const SKELETON_COUNT = 8;

// ProductCard mengharapkan bentuk MenuItem (field "image"), sementara API
// membalas AdminProduct (field "image_url") -- petakan di sini saja supaya
// ProductCard tidak perlu tahu soal itu.
function toMenuItem(product: AdminProduct): MenuItem {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    image: product.image_url,
    available: product.available,
  };
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-espresso/10 bg-white/60 shadow-sm">
      <div className="aspect-square w-full animate-pulse bg-espresso/10" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-espresso/10" />
        <div className="h-3 w-full animate-pulse rounded bg-espresso/10" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-espresso/10" />
        <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-espresso/10" />
      </div>
    </div>
  );
}

export default function MenuBrowser() {
  const [activeTab, setActiveTab] = useState<FilterKey>("semua");
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // setState di sini dipanggil dari .then/.catch/.finally, bukan sinkron
  // di badan efek, supaya tidak kena cascading render. loading di-set ke
  // true dari event handler (klik tab / klik Coba Lagi), bukan di sini.
  useEffect(() => {
    let cancelled = false;
    const query = activeTab === "semua" ? "" : `?category=${activeTab}`;

    apiFetch(`/api/products${query}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data: AdminProduct[] = await res.json();
        if (!cancelled) {
          setProducts(data.map(toMenuItem));
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, retryKey]);

  function handleTabClick(tab: FilterKey) {
    setActiveTab(tab);
    setLoading(true);
    setError(false);
  }

  function handleRetry() {
    setLoading(true);
    setError(false);
    setRetryKey((key) => key + 1);
  }

  return (
    <>
      <div className="mb-10 flex flex-wrap justify-center gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabClick(tab.key)}
            aria-pressed={activeTab === tab.key}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? "bg-espresso text-cream"
                : "border border-espresso/10 bg-white/60 text-espresso/70 hover:bg-accent/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-espresso/10 bg-white/60 px-6 py-16 text-center">
          <span className="text-4xl">☕</span>
          <div>
            <p className="text-lg font-semibold text-espresso">
              Menu sedang tidak bisa dimuat
            </p>
            <p className="mt-1 text-sm text-espresso/60">
              Sepertinya ada gangguan koneksi ke server. Coba lagi sebentar, ya.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-full bg-espresso px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-espresso/90"
          >
            Coba Lagi
          </button>
        </div>
      ) : products.length === 0 ? (
        <p className="py-12 text-center text-espresso/50">
          Belum ada produk di kategori ini.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {products.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
