import type { Metadata } from "next";
import AdminBookings from "@/components/admin-bookings";

export const metadata: Metadata = {
  title: "Booking",
};

export default function AdminBookingsPage() {
  return <AdminBookings />;
}
