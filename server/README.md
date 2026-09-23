# Kopi Kita — Backend (`server/`)

Backend Express hidup di sini sebagai bagian dari aplikasi Next.js yang
sama — bukan proses/server terpisah. `server/app.ts` mengekspor instance
Express (tanpa `.listen()`); `app/api/[...slug]/route.ts` menjembatani
setiap request `/api/*` yang masuk ke Next.js dan meneruskannya ke Express
lewat `light-my-request` (dipanggil sebagai fungsi biasa, bukan lewat
network). Jadi semua jalan satu origin di port yang sama dengan halaman
Next.js — tidak ada CORS, tidak ada port terpisah.

## Database

Skema dan data awal ada di `db/schema.sql` dan `db/seed.sql`. Keduanya
dijalankan terhadap PostgreSQL yang sudah jalan lewat `docker-compose.yml`
di root proyek (service `db`, database `kopikita`).

### Cara cepat: reset dari nol

```bash
npm run db:reset
```

Menjalankan `scripts/db-reset.sh`: pastikan container `db` jalan, drop
semua tabel (kalau ada), lalu jalankan ulang `schema.sql` dan `seed.sql`
dari nol. Aman dijalankan berkali-kali kapan saja butuh data bersih lagi.

### Manual, langkah per langkah

```bash
cd ~/latihan-module
docker compose up -d
docker compose ps   # pastikan status "healthy"

# 1. Jalankan schema.sql (buat tabel)
docker compose exec -T db psql -U kopikita -d kopikita < server/db/schema.sql

# 2. Jalankan seed.sql (isi data awal)
docker compose exec -T db psql -U kopikita -d kopikita < server/db/seed.sql
```

Kedua file aman dijalankan berkali-kali (`CREATE TABLE IF NOT EXISTS` dan
`ON CONFLICT ... DO NOTHING`) — tidak akan duplikat data atau error kalau
diulang, tapi juga tidak menghapus data yang sudah berubah lewat aplikasi
(pakai `npm run db:reset` kalau memang mau bersih total).

### Verifikasi jumlah baris

```bash
docker compose exec -T db psql -U kopikita -d kopikita -c \
  "SELECT 'products' AS table_name, COUNT(*) FROM products
   UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
   UNION ALL SELECT 'admins', COUNT(*) FROM admins;"
```

Setelah seed dari nol: `products = 10`, `bookings = 5`, `admins = 1`.

## Login admin default

- Email: `admin@kopikita.id`
- Password: `kopikita-admin`

Password disimpan ter-hash (bcrypt via `pgcrypto` saat seeding).
`POST /api/auth/login` memverifikasinya dengan `bcrypt.compare` (package
`bcryptjs`) — hash `$2a$...` dari `pgcrypto` kompatibel dengan bcrypt standar.

## Menjalankan

Tidak ada server/proses terpisah untuk dijalankan — cukup jalankan Next.js
seperti biasa dari root proyek:

```bash
cp .env.example .env.local   # isi DATABASE_URL kalau beda dari default
npm install
npm run dev   # Next.js + API Express sekaligus, di http://localhost:3000
```

## Endpoint

| Endpoint | Tugas | Siapa yang boleh |
|---|---|---|
| `GET /api/products` | daftar produk, bisa filter `?category=` | publik |
| `POST /api/products` | tambah produk | admin |
| `PUT /api/products/:id` | ubah produk (field yang dikirim saja) | admin |
| `DELETE /api/products/:id` | hapus produk | admin |
| `POST /api/bookings` | buat booking | publik |
| `GET /api/bookings` | daftar booking, urut tanggal+jam terdekat | admin |
| `PATCH /api/bookings/:id` | ubah status booking | admin |
| `POST /api/auth/login` | login admin, set cookie session | publik |
| `POST /api/auth/logout` | hapus session + cookie | admin |
| `GET /api/auth/me` | data admin yang sedang login | admin |

## Autentikasi admin (session cookie)

Login menyimpan session di **Map di memori** (`server/sessionStore.ts`,
di-cache lewat `globalThis` supaya bertahan lewat hot-reload dev) dan
mengirim id session lewat cookie `httpOnly` bernama `kopikita_session`
(berlaku 8 jam). Endpoint "admin" di tabel atas dijaga middleware
`requireAdmin` yang membaca cookie ini.

> Catatan: penyimpanan session di Map cukup untuk pengembangan lokal —
> hilang saat server benar-benar di-restart, dan tidak terbagi kalau nanti
> jalan lebih dari satu instance. Pindahkan ke tabel database (atau Redis)
> sebelum deploy ke production / multi-instance.

Karena sekarang satu origin (bukan lintas port lagi), cookie sudah otomatis
ikut terkirim di request `fetch` biasa — `lib/api.ts` tetap set
`credentials: "include"` (aman, tidak mengubah apa pun untuk same-origin).

Contoh alur lewat curl (`-c`/`-b` menyimpan & mengirim ulang cookie):

```bash
# Login — simpan cookie ke file
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kopikita.id","password":"kopikita-admin"}'

# Pakai cookie untuk endpoint admin-only
curl -b cookies.txt http://localhost:3000/api/bookings
curl -b cookies.txt http://localhost:3000/api/auth/me

# Logout
curl -b cookies.txt -X POST http://localhost:3000/api/auth/logout
```

### Kode status

- `400` — input tidak valid (field kosong/salah format)
- `401` — belum login / cookie session tidak ada / sesi kedaluwarsa / kredensial login salah
- `404` — data atau route tidak ditemukan
- `500` — error server
