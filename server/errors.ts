/**
 * Error terkontrol dengan status code HTTP yang jelas.
 * Dilempar dari route handler, ditangkap oleh error handler pusat di app.ts.
 */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
