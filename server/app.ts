import cookieParser from "cookie-parser";
import express, { type NextFunction, type Request, type Response } from "express";
import authRouter from "./routes/auth";
import bookingsRouter from "./routes/bookings";
import productsRouter from "./routes/products";
import { ApiError } from "./errors";

// App Express murni -- TIDAK listen() di port sendiri. Dipanggil sebagai
// handler biasa dari app/api/[...slug]/route.ts (lewat light-my-request),
// jadi semua request /api/* tetap satu origin dengan halaman Next.js.
// Karena itu juga middleware cors sudah tidak diperlukan sama sekali.
const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/bookings", bookingsRouter);

// Route tidak dikenal — tetap balas JSON, bukan halaman HTML default Express.
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} tidak ditemukan` });
});

// Error handler pusat. ApiError -> status code aslinya, selain itu -> 500.
// Express mengenali error handler dari jumlah parameternya (harus 4) --
// _next tetap wajib ada meski tidak dipakai di sini.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Terjadi kesalahan pada server" });
});

export default app;
