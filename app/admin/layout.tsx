import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin Kopi Kita",
    template: "%s | Admin Kopi Kita",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
