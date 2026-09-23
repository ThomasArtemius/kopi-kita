// Default "" = path relatif di origin yang sama, karena backend Express
// (server/) sekarang jadi bagian dari proses Next.js ini sendiri, dipanggil
// lewat app/api/[...slug]/route.ts -- bukan server terpisah lagi.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * fetch ke API dengan base URL + credentials "include" bawaan, supaya
 * cookie session admin (httpOnly, di-set oleh POST /api/auth/login) selalu
 * ikut terkirim.
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}
