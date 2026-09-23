"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

const links = [
  { href: "/admin/products", label: "Produk" },
  { href: "/admin/bookings", label: "Booking" },
];

export default function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-full flex-col justify-between gap-8 border-b border-espresso/10 bg-white/70 p-6 sm:h-svh sm:w-64 sm:shrink-0 sm:border-b-0 sm:border-r">
      <div className="flex flex-col gap-8">
        <Link href="/admin" className="block">
          <span className="text-lg font-bold text-espresso">Kopi Kita</span>
          <p className="text-xs text-espresso/50">Admin</p>
        </Link>

        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-espresso text-cream"
                    : "text-espresso/70 hover:bg-accent/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-3 border-t border-espresso/10 pt-4">
        <p className="truncate text-xs text-espresso/50">{adminEmail}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-espresso/15 px-4 py-2 text-sm font-semibold text-espresso transition-colors hover:bg-espresso hover:text-cream"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
