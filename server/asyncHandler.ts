import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Bungkus async route handler supaya error (termasuk rejected promise dari
 * query database) otomatis diteruskan ke error handler pusat lewat next(),
 * tanpa perlu try/catch berulang di tiap route.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
