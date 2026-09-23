"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABEL, type AdminProduct, type ProductCategory } from "@/lib/types";

interface FormState {
  name: string;
  description: string;
  price: string;
  category: ProductCategory | "";
  image_url: string;
  available: boolean;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  category: "",
  image_url: "",
  available: true,
};

function productToForm(product: AdminProduct): FormState {
  return {
    name: product.name,
    description: product.description,
    price: String(product.price),
    category: product.category,
    image_url: product.image_url,
    available: product.available,
  };
}

interface Props {
  mode: "create" | "edit";
  product: AdminProduct | null;
  onClose: () => void;
  onSaved: () => void;
}

const inputClass =
  "w-full rounded-xl border border-espresso/15 bg-cream px-4 py-2.5 text-espresso placeholder:text-espresso/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";
const labelClass = "text-sm font-semibold text-espresso";

export default function AdminProductModal({ mode, product, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(product ? productToForm(product) : emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleChange<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const priceNum = Number(form.price);
    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.image_url.trim() ||
      !form.category ||
      !Number.isFinite(priceNum) ||
      priceNum <= 0
    ) {
      setError("Semua field wajib diisi dengan benar (harga harus lebih dari 0).");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: priceNum,
        category: form.category,
        image_url: form.image_url.trim(),
        available: form.available,
      };

      const res =
        mode === "create"
          ? await apiFetch("/api/products", { method: "POST", body: JSON.stringify(payload) })
          : await apiFetch(`/api/products/${product!.id}`, {
              method: "PUT",
              body: JSON.stringify(payload),
            });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Gagal menyimpan produk.");
        return;
      }

      onSaved();
    } catch {
      setError("Tidak bisa menghubungi server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-cream p-6 shadow-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-espresso">
            {mode === "create" ? "Tambah Produk" : "Edit Produk"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-full px-2 py-1 text-espresso/50 transition-colors hover:bg-espresso/10 hover:text-espresso"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className={labelClass}>
              Nama
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className={labelClass}>
              Deskripsi
            </label>
            <textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="price" className={labelClass}>
                Harga (Rp)
              </label>
              <input
                id="price"
                type="number"
                min={1}
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="category" className={labelClass}>
                Kategori
              </label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value as ProductCategory)}
                className={inputClass}
              >
                <option value="" disabled>
                  Pilih kategori
                </option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {PRODUCT_CATEGORY_LABEL[cat]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="image_url" className={labelClass}>
              Image URL
            </label>
            <input
              id="image_url"
              type="text"
              placeholder="/images/menu/nama-produk.jpg"
              value={form.image_url}
              onChange={(e) => handleChange("image_url", e.target.value)}
              className={inputClass}
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-espresso">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => handleChange("available", e.target.checked)}
              className="h-4 w-4 rounded border-espresso/30 accent-accent"
            />
            Tersedia dijual
          </label>

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-espresso/15 px-5 py-2.5 text-sm font-semibold text-espresso transition-colors hover:bg-espresso/5"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
