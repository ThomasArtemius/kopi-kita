import type { Metadata } from "next";
import MenuBrowser from "@/components/menu-browser";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Jelajahi menu kopi, non-kopi, dan pastry Kopi Kita — filter berdasarkan kategori.",
};

export default function MenuPage() {
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

      <MenuBrowser />
    </main>
  );
}
