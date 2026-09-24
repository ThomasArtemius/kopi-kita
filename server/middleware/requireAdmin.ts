import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors";
import { getSession, SESSION_COOKIE_NAME } from "../sessionStore";

export interface AuthedRequest extends Request {
  admin?: { id: number; email: string };
}

/**
 * Gerbang untuk endpoint admin-only. Baca cookie session (di-set oleh
 * POST /api/auth/login), periksa ke tabel `sessions` di database, tolak
 * kalau tidak ada atau sudah kadaluarsa, dan tempel data admin ke
 * req.admin kalau valid.
 *
 * Pemeriksaan ke database itu async, dan Express 4 tidak menangkap
 * promise yang ditolak di middleware -- jadi error diteruskan manual
 * lewat next(err).
 */
export function requireAdmin(req: AuthedRequest, _res: Response, next: NextFunction) {
  const sessionId: string | undefined = req.cookies?.[SESSION_COOKIE_NAME];

  if (!sessionId) {
    next(new ApiError(401, "Belum login sebagai admin"));
    return;
  }

  getSession(sessionId)
    .then((session) => {
      if (!session) {
        throw new ApiError(401, "Sesi tidak valid atau sudah kedaluwarsa, silakan login lagi");
      }
      req.admin = { id: session.adminId, email: session.email };
      next();
    })
    .catch(next);
}
