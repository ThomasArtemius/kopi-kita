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

export default function MenuBrowser() {
  const [activeTab, setActiveTab] = useState<FilterKey>("semua");
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // setState di sini dipanggil dari .then/.catch/.finally, bukan sinkron
  // di badan efek, supaya tidak kena cascading render.
  useEffect(() => {
    let cancelled = false;
    const query = activeTab === "semua" ? "" : `?category=${activeTab}`;

    apiFetch(`/api/products${query}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data: AdminProduct[] = await res.json();
        if (!cancelled) {
          setProducts(data.map(toMenuItem));
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat menu. Coba muat ulang halaman.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  return (
    <>
      <div className="mb-10 flex flex-wrap justify-center gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
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

      {error && (
        <p className="mb-6 rounded-xl bg-red-50 px-4 py-2 text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-12 text-center text-espresso/50">Memuat menu...</p>
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
