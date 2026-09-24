import Image from "next/image";
import Link from "next/link";

const featuredMenu = [
  {
    name: "Kopi Susu Gula Aren",
    description: "Espresso, susu segar, dan gula aren asli — manis pas, tanpa berlebihan.",
    price: "Rp 22.000",
    icon: "☕",
  },
  {
    name: "Cappuccino Klasik",
    description: "Espresso lembut berpadu foam susu creamy dengan taburan cinnamon.",
    price: "Rp 25.000",
    icon: "🍵",
  },
  {
    name: "Croissant Almond",
    description: "Croissant renyah, mentega, dengan taburan almond panggang.",
    price: "Rp 28.000",
    icon: "🥐",
  },
];

const testimonials = [
  {
    name: "Rina Maharani",
    rating: 5,
    comment:
      "Kopi Susu Kita-nya juara! Manisnya pas, suasananya nyaman buat kerja seharian.",
  },
  {
    name: "Dimas Prakoso",
    rating: 5,
    comment:
      "Booking mejanya gampang banget, sampai langsung dapat tempat yang kami mau.",
  },
  {
    name: "Alya Putri",
    rating: 4,
    comment:
      "Croissant Almond-nya renyah dan wangi. Pelayanannya ramah, pasti balik lagi.",
  },
];

const openingHours = [
  { day: "Senin – Jumat", time: "07.00 – 21.00" },
  { day: "Sabtu – Minggu", time: "08.00 – 22.00" },
];

const address = "Jl. Kenangan Manis No. 12, Bandung, Jawa Barat";

const socialLinks = [
  { label: "Instagram", handle: "@kopikita", href: "#" },
  { label: "WhatsApp", handle: "0812-3456-7890", href: "#" },
  { label: "Facebook", handle: "Kopi Kita", href: "#" },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* 1. Hero */}
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col items-start gap-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-espresso sm:text-5xl">
            Kopi Kita
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-espresso/80">
            Secangkir kehangatan, senyaman rumah sendiri. Ngopi santai,
            kualitas istimewa.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/menu"
              className="rounded-full bg-espresso px-6 py-3 text-center text-sm font-semibold text-cream transition-colors hover:bg-espresso/90"
            >
              Lihat Menu
            </Link>
            <Link
              href="/booking"
              className="rounded-full bg-accent px-6 py-3 text-center text-sm font-semibold text-cream transition-colors hover:bg-accent-dark"
            >
              Booking Meja
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-lg">
          <Image
            src="/images/hero-coffee.png"
            alt="Suasana hangat di dalam kedai Kopi Kita"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </section>

      {/* 2. Menu Favorit */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="mb-10 flex flex-col gap-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-espresso">
            Menu Favorit
          </h2>
          <p className="text-espresso/70">
            Pilihan terfavorit pelanggan Kopi Kita.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {featuredMenu.map((item) => (
            <div
              key={item.name}
              className="flex flex-col gap-4 rounded-2xl border border-espresso/10 bg-white/60 p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-2xl">
                {item.icon}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-espresso">
                  {item.name}
                </h3>
                <p className="text-sm text-espresso/70">{item.description}</p>
              </div>
              <span className="mt-auto text-base font-semibold text-accent">
                {item.price}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Testimoni Pelanggan */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="mb-10 flex flex-col gap-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-espresso">
            Testimoni Pelanggan
          </h2>
          <p className="text-espresso/70">
            Cerita singkat dari mereka yang sudah mampir ke Kopi Kita.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col gap-4 rounded-2xl border border-espresso/10 bg-white/60 p-6 shadow-sm"
            >
              <div
                role="img"
                aria-label={`Rating ${item.rating} dari 5`}
                className="flex gap-0.5 text-lg leading-none"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    aria-hidden="true"
                    className={star <= item.rating ? "text-accent" : "text-espresso/20"}
                  >
                    ★
                  </span>
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed text-espresso/80">
                “{item.comment}”
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent"
                >
                  {item.name.charAt(0)}
                </span>
                <span className="text-sm font-semibold text-espresso">{item.name}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 4. Info: jam buka, alamat, placeholder peta */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 rounded-3xl bg-espresso/[0.04] p-8 md:grid-cols-2 md:p-12">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-espresso">
                Jam Buka
              </h2>
              <dl className="mt-3 flex flex-col gap-1 text-espresso/80">
                {openingHours.map((item) => (
                  <div key={item.day} className="flex justify-between gap-4">
                    <dt>{item.day}</dt>
                    <dd className="font-medium text-espresso">{item.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-espresso">
                Alamat
              </h2>
              <p className="mt-3 text-espresso/80">{address}</p>
            </div>
          </div>
          <div
            className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-espresso/20 bg-[linear-gradient(45deg,rgba(31,26,23,0.04)_25%,transparent_25%,transparent_50%,rgba(31,26,23,0.04)_50%,rgba(31,26,23,0.04)_75%,transparent_75%,transparent)] bg-[length:24px_24px] text-center"
            aria-label="Placeholder peta lokasi Kopi Kita"
          >
            <span className="text-3xl">📍</span>
            <p className="text-sm font-medium text-espresso/70">
              Peta lokasi segera hadir
            </p>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="mt-auto border-t border-espresso/10 bg-espresso text-cream">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-lg font-bold">Kopi Kita</span>
            <p className="max-w-xs text-sm text-cream/70">{address}</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-cream/60">
              Jam Buka
            </span>
            {openingHours.map((item) => (
              <p key={item.day} className="text-sm text-cream/70">
                {item.day}: {item.time}
              </p>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-cream/60">
              Sosial Media
            </span>
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                className="text-sm text-cream/70 transition-colors hover:text-accent"
              >
                {social.label} — {social.handle}
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t border-cream/10 px-6 py-4 text-center text-xs text-cream/50">
          © {new Date().getFullYear()} Kopi Kita. Semua hak cipta dilindungi.
        </div>
      </footer>
    </main>
  );
}
