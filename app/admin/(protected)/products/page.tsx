import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Produk",
};

export default function AdminProductsPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold text-espresso">Produk</h1>
      <p className="text-sm text-espresso/70">
        Halaman kelola produk (tambah/ubah/hapus) belum dibuat — menyusul.
      </p>
    </div>
  );
}
