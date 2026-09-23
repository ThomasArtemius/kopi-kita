import type { Metadata } from "next";
import AdminLoginForm from "@/components/admin-login-form";

export const metadata: Metadata = {
  title: "Login",
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-svh flex-1 items-center justify-center px-6 py-16">
      <AdminLoginForm />
    </main>
  );
}
