-- Data awal Kopi Kita
-- Catatan: field frontend "image" dipetakan ke kolom "image_url" di sini.

-- 10 produk, kategori seimbang (3 kopi / 3 non-kopi / 4 pastry),
-- harga 15.000 - 35.000.
INSERT INTO products (id, name, description, price, category, image_url, available) VALUES
  (1, 'Kopi Susu Kita', 'Perpaduan espresso rich dan susu segar dengan gula aren yang manisnya pas di hati.', 22000, 'kopi', '/images/menu/kopi-susu-kita.jpg', true),
  (2, 'Americano', 'Espresso murni dan air panas, sederhana tapi bikin melek dan fokus seharian.', 18000, 'kopi', '/images/menu/americano.jpg', true),
  (3, 'Es Kopi Gula Aren', 'Sensasi dingin, manis karamel gula aren, dan pahit kopi yang klop banget di siang hari.', 20000, 'kopi', '/images/menu/es-kopi-gula-aren.jpg', true),
  (4, 'Matcha Latte', 'Bubuk matcha premium diseduh lembut dengan susu creamy, hijau menyegarkan setiap tegukan.', 27000, 'non-kopi', '/images/menu/matcha-latte.jpg', true),
  (5, 'Coklat Panas', 'Coklat leleh kental yang hangat dan manis, teman sempurna saat hujan atau malam santai.', 24000, 'non-kopi', '/images/menu/coklat-panas.jpg', true),
  (6, 'Taro Latte', 'Ungu lembut nan creamy, perpaduan taro asli dan susu yang manisnya bikin nagih di setiap tegukan.', 28000, 'non-kopi', '/images/menu/taro-latte.jpg', true),
  (7, 'Croissant Almond', 'Croissant mentega renyah bertabur almond panggang, wangi dan gurih-manis pas buat teman ngopi.', 21000, 'pastry', '/images/menu/croissant.jpg', true),
  (8, 'Roti Bakar Keju', 'Roti panggang keju leleh melimpah, gurih meleleh di setiap gigitan yang bikin nagih.', 17000, 'pastry', '/images/menu/roti-bakar-keju.jpg', true),
  (9, 'Banana Bread', 'Roti pisang lembut dan harum, manis alami yang cocok jadi teman ngopi santai.', 19000, 'pastry', '/images/menu/banana-bread.jpg', false),
  (10, 'New York Cheesecake', 'Lembut, creamy, dengan sentuhan asam yang pas — sepotong kemewahan buat menutup hari ngopimu.', 33000, 'pastry', '/images/menu/cheesecake.jpg', true)
ON CONFLICT (id) DO NOTHING;

-- Samakan sequence id dengan data yang baru di-insert manual di atas,
-- supaya INSERT berikutnya (tanpa id eksplisit) tidak bentrok.
SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT MAX(id) FROM products));

-- 5 booking contoh: tanggal relatif ke CURRENT_DATE (campuran lampau &
-- akan datang) supaya tetap masuk akal kapan pun seed ini dijalankan,
-- dan status berbeda-beda supaya /admin/bookings punya contoh tiap status.
INSERT INTO bookings (id, customer_name, whatsapp, booking_date, booking_time, party_size, notes, status) VALUES
  (1, 'Rangga Pratama', '081234567801', CURRENT_DATE + INTERVAL '1 day', '18:00', 2, NULL, 'pending'),
  (2, 'Sinta Wulandari', '081234567802', CURRENT_DATE + INTERVAL '3 days', '19:00', 4, 'Dekat jendela ya', 'confirmed'),
  (3, 'Budi Hartono', '081234567803', CURRENT_DATE - INTERVAL '5 days', '12:00', 3, NULL, 'done'),
  (4, 'Maya Kusuma', '081234567804', CURRENT_DATE + INTERVAL '7 days', '20:00', 6, 'Ulang tahun, tolong siapkan lilin kecil', 'pending'),
  (5, 'Andre Setiawan', '081234567805', CURRENT_DATE - INTERVAL '2 days', '17:00', 2, 'Berhalangan hadir', 'cancelled')
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('bookings', 'id'), (SELECT MAX(id) FROM bookings));

-- Admin default. Password "kopikita-admin" di-hash pakai bcrypt (pgcrypto),
-- bukan disimpan plain text.
INSERT INTO admins (email, password_hash) VALUES
  ('admin@kopikita.id', crypt('kopikita-admin', gen_salt('bf', 10)))
ON CONFLICT (email) DO NOTHING;
