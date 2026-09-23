export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * fetch ke backend Express dengan base URL + credentials "include" bawaan,
 * supaya cookie session admin (httpOnly, di-set oleh POST /api/auth/login)
 * selalu ikut terkirim ke API yang beda port (3000 -> 4000).
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
