import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../errors.js";

export interface AdminPayload {
  sub: number;
  email: string;
}

export interface AuthedRequest extends Request {
  admin?: AdminPayload;
}

/**
 * Gerbang untuk endpoint admin-only. Cek header
 * "Authorization: Bearer <token>", verifikasi JWT-nya, lalu tempel
 * payload admin ke req.admin. Token didapat dari POST /api/admin/login.
 */
export function requireAdmin(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Butuh login admin (header Authorization: Bearer <token>)");
  }

  const token = header.slice("Bearer ".length).trim();
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Kesalahan konfigurasi server, bukan kesalahan client -> biarkan
    // error handler pusat menangkapnya sebagai 500.
    throw new Error("JWT_SECRET belum diset di .env");
  }

  try {
    const payload = jwt.verify(token, secret) as unknown as AdminPayload;
    req.admin = payload;
    next();
  } catch {
    throw new ApiError(401, "Token tidak valid atau sudah kedaluwarsa");
  }
}
