"use client";

import { useState } from "react";
import ProductCard from "@/components/product-card";
import { menuData, type MenuCategory } from "@/lib/menu-data";

type FilterKey = "semua" | MenuCategory;

const tabs: { key: FilterKey; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "kopi", label: "Kopi" },
  { key: "non-kopi", label: "Non-Kopi" },
  { key: "pastry", label: "Pastry" },
];

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState<FilterKey>("semua");

  const filteredMenu =
    activeTab === "semua"
      ? menuData
      : menuData.filter((item) => item.category === activeTab);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
      <div className="mb-8 flex flex-col gap-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-espresso">
          Menu Kopi Kita
        </h1>
        <p className="text-espresso/70">
          Racikan kopi, minuman non-kopi, dan pastry segar — dibuat dengan
          bahan pilihan setiap hari.
        </p>
      </div>

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

      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
        {filteredMenu.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
}
