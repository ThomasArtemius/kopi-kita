"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Login gagal, coba lagi.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Tidak bisa menghubungi server. Pastikan API sedang jalan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-5 rounded-3xl border border-espresso/10 bg-white/70 p-8 shadow-sm"
    >
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold text-espresso">Login Admin</h1>
        <p className="text-sm text-espresso/70">Kelola produk dan booking Kopi Kita.</p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-espresso">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-espresso/15 bg-cream px-4 py-2.5 text-espresso placeholder:text-espresso/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-espresso">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-espresso/15 bg-cream px-4 py-2.5 text-espresso placeholder:text-espresso/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-espresso px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-espresso/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
