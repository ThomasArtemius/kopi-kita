"use client";

import Image from "next/image";
import { useState } from "react";
import { formatRupiah } from "@/lib/format";
import type { MenuItem } from "@/lib/menu-data";

const categoryIcon: Record<MenuItem["category"], string> = {
  kopi: "☕",
  "non-kopi": "🍵",
  pastry: "🥐",
};

export default function ProductCard({ item }: { item: MenuItem }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-espresso/10 bg-white/60 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-accent/10">
        {!imageFailed ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            onError={() => setImageFailed(true)}
            sizes="(min-width: 768px) 25vw, 50vw"
            className={`object-cover transition-opacity ${
              item.available ? "" : "opacity-60"
            }`}
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center text-4xl ${
              item.available ? "" : "opacity-60"
            }`}
          >
            {categoryIcon[item.category]}
          </div>
        )}
        {!item.available && (
          <span className="absolute right-2 top-2 rounded-full bg-espresso px-3 py-1 text-xs font-semibold text-cream">
            Habis
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-semibold text-espresso">{item.name}</h3>
        <p className="line-clamp-2 text-sm text-espresso/70">
          {item.description}
        </p>
        <span className="mt-auto pt-2 font-semibold text-accent">
          {formatRupiah(item.price)}
        </span>
      </div>
    </div>
  );
}
