"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin-sidebar";
import { apiFetch } from "@/lib/api";

interface AdminInfo {
  id: number;
  email: string;
}

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    apiFetch("/api/auth/me")
      .then(async (res) => {
        if (cancelled) return;

        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }

        const body = await res.json();
        setAdmin(body.admin);
        setChecking(false);
      })
      .catch(() => {
        if (!cancelled) router.replace("/admin/login");
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking || !admin) {
    return (
      <main className="flex min-h-svh flex-1 items-center justify-center">
        <p className="text-sm text-espresso/60">Memeriksa sesi admin...</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-svh flex-1 flex-col sm:flex-row">
      <AdminSidebar adminEmail={admin.email} />
      <main className="flex-1 p-6 sm:p-10">{children}</main>
    </div>
  );
}
