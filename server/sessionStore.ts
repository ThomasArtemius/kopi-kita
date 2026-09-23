import crypto from "node:crypto";

export interface SessionData {
  adminId: number;
  email: string;
  createdAt: number;
  expiresAt: number;
}

export const SESSION_COOKIE_NAME = "kopikita_session";
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 jam

// Simpan Map di globalThis supaya bertahan lewat hot reload dev (next dev
// me-reload modul yang berubah -- tanpa ini, admin bisa "ter-logout" setiap
// kali ada file lain yang di-save). Tetap: penyimpanan session di memori
// cukup untuk pengembangan lokal -- hilang saat server benar-benar
// di-restart, dan tidak terbagi kalau nanti jalan lebih dari satu instance.
// Pindahkan ke tabel di database (atau Redis) sebelum deploy ke
// production / multi-instance.
const globalForSessions = globalThis as unknown as {
  __kopikitaSessions?: Map<string, SessionData>;
};

const sessions = globalForSessions.__kopikitaSessions ?? new Map<string, SessionData>();

if (process.env.NODE_ENV !== "production") {
  globalForSessions.__kopikitaSessions = sessions;
}

export function createSession(adminId: number, email: string): string {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  sessions.set(sessionId, {
    adminId,
    email,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  });
  return sessionId;
}

export function getSession(sessionId: string): SessionData | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;

  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return undefined;
  }

  return session;
}

export function destroySession(sessionId: string): void {
  sessions.delete(sessionId);
}
