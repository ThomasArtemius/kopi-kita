import pg from "pg";

const { Pool, types } = pg;

// Kolom DATE (oid 1082) secara default di-parse node-pg jadi objek JS Date
// (dianggap tengah malam di timezone lokal proses), lalu ikut bergeser saat
// di-JSON.stringify ke UTC — bisa membuat tanggal mundur/maju sehari.
// Kembalikan apa adanya sebagai string "YYYY-MM-DD" dari Postgres.
types.setTypeParser(types.builtins.DATE, (value) => value);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL belum diset. Salin api/.env.example menjadi api/.env lalu isi nilainya.",
  );
}

export const pool = new Pool({ connectionString });

pool.on("error", (err) => {
  // Error di koneksi idle pada pool (bukan error per-query) — log saja,
  // pool akan otomatis membuat koneksi baru saat dibutuhkan.
  console.error("Unexpected error pada koneksi database:", err);
});
