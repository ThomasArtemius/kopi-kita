"use client";

import { useCallback, useEffect, useState } from "react";
import AdminProductModal from "@/components/admin-product-modal";
import { apiFetch } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import { PRODUCT_CATEGORY_LABEL, type AdminProduct } from "@/lib/types";

type ModalState = { mode: "create" } | { mode: "edit"; product: AdminProduct } | null;

async function fetchProductList(): Promise<AdminProduct[]> {
  const res = await apiFetch("/api/products");
  if (!res.ok) throw new Error("Gagal memuat daftar produk.");
  return res.json();
}

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Muat data awal. setState di sini sengaja dipanggil dari dalam
  // .then()/.catch()/.finally() (bukan sinkron di badan efek) supaya
  // tidak memicu cascading render.
  useEffect(() => {
    let cancelled = false;

    fetchProductList()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat daftar produk.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Dipakai untuk refresh setelah aksi user (bukan di dalam efek), jadi
  // aman memanggil setState langsung.
  const refreshProducts = useCallback(async () => {
    try {
      const data = await fetchProductList();
      setProducts(data);
      setError(null);
    } catch {
      setError("Gagal memuat daftar produk.");
    }
  }, []);

  async function handleToggleAvailable(product: AdminProduct) {
    setTogglingId(product.id);
    setError(null);
    try {
      const res = await apiFetch(`/api/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify({ available: !product.available }),
      });
      if (!res.ok) throw new Error();
      const updated: AdminProduct = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch {
      setError("Gagal mengubah status ketersediaan.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(product: AdminProduct) {
    const confirmed = window.confirm(
      `Hapus produk "${product.name}"? Tindakan ini tidak bisa dibatalkan.`,
    );
    if (!confirmed) return;

    setDeletingId(product.id);
    setError(null);
    try {
      const res = await apiFetch(`/api/products/${product.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error();
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch {
      setError("Gagal menghapus produk.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleSaved() {
    setModalState(null);
    refreshProducts();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-espresso">Produk</h1>
          <p className="text-sm text-espresso/70">Kelola menu Kopi Kita.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalState({ mode: "create" })}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-accent-dark"
        >
          Tambah Produk
        </button>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-espresso/10 bg-white/70">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-espresso/10 text-xs uppercase tracking-wide text-espresso/50">
              <th className="px-4 py-3 font-semibold">Nama</th>
              <th className="px-4 py-3 font-semibold">Kategori</th>
              <th className="px-4 py-3 font-semibold">Harga</th>
              <th className="px-4 py-3 font-semibold">Tersedia</th>
              <th className="px-4 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-espresso/10">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-espresso/50">
                  Memuat produk...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-espresso/50">
                  Belum ada produk.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 font-medium text-espresso">{product.name}</td>
                  <td className="px-4 py-3 text-espresso/70">
                    {PRODUCT_CATEGORY_LABEL[product.category]}
                  </td>
                  <td className="px-4 py-3 text-espresso/70">{formatRupiah(product.price)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={product.available}
                      disabled={togglingId === product.id}
                      onClick={() => handleToggleAvailable(product)}
                      className={`relative h-6 w-11 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        product.available ? "bg-accent" : "bg-espresso/20"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          product.available ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setModalState({ mode: "edit", product })}
                        className="rounded-full border border-espresso/15 px-3 py-1.5 text-xs font-semibold text-espresso transition-colors hover:bg-espresso/5"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === product.id}
                        onClick={() => handleDelete(product)}
                        className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === product.id ? "Menghapus..." : "Hapus"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalState && (
        <AdminProductModal
          mode={modalState.mode}
          product={modalState.mode === "edit" ? modalState.product : null}
          onClose={() => setModalState(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
