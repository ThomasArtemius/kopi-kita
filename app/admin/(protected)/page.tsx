import type { Metadata } from "next";
import AdminDashboard from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Ringkasan",
};

export default function AdminHomePage() {
  return <AdminDashboard />;
}
