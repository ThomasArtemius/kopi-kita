# Kopi Kita — Backend

## Database

Skema dan data awal ada di `db/schema.sql` dan `db/seed.sql`. Keduanya dijalankan
terhadap PostgreSQL yang sudah jalan lewat `docker-compose.yml` di root proyek
(service `db`, database `kopikita`).

### 1. Pastikan container database jalan

```bash
cd ~/latihan-module
docker compose up -d
docker compose ps   # pastikan status "healthy"
```

### 2. Jalankan schema.sql (buat tabel)

```bash
docker compose exec -T db psql -U kopikita -d kopikita < api/db/schema.sql
```

### 3. Jalankan seed.sql (isi data awal)

```bash
docker compose exec -T db psql -U kopikita -d kopikita < api/db/seed.sql
```

Kedua file aman dijalankan berkali-kali (`CREATE TABLE IF NOT EXISTS` dan
`ON CONFLICT ... DO NOTHING`) — tidak akan duplikat data atau error kalau
diulang.

### 4. Verifikasi jumlah baris

```bash
docker compose exec -T db psql -U kopikita -d kopikita -c \
  "SELECT 'products' AS table_name, COUNT(*) FROM products
   UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
   UNION ALL SELECT 'admins', COUNT(*) FROM admins;"
```

Hasil yang diharapkan: `products = 8`, `bookings = 0` (belum ada booking
masuk), `admins = 1`.

## Login admin default

- Email: `admin@kopikita.id`
- Password: `kopikita-admin`

Password disimpan ter-hash (bcrypt via `pgcrypto`), bukan plain text.
`POST /api/admin/login` memverifikasinya lewat `crypt(input_password,
password_hash) = password_hash` langsung di query SQL.

## Menjalankan server API

```bash
cd api
cp .env.example .env   # lalu isi JWT_SECRET dengan string acak sendiri
npm install
npm run dev             # tsx watch, auto-restart — jalan di http://localhost:4000
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
| `POST /api/admin/login` | login admin, balas JWT | publik |

Endpoint "admin" butuh header `Authorization: Bearer <token>` — token
didapat dari `POST /api/admin/login`, berlaku 8 jam.

Contoh:

```bash
# Login, ambil token
TOKEN=$(curl -s -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kopikita.id","password":"kopikita-admin"}' \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])")

# Pakai token untuk endpoint admin-only
curl http://localhost:4000/api/bookings -H "Authorization: Bearer $TOKEN"
```

### Kode status

- `400` — input tidak valid (field kosong/salah format)
- `401` — belum login / token tidak ada / token salah-kedaluwarsa / kredensial login salah
- `404` — data atau route tidak ditemukan
- `500` — error server
