export const PRODUCT_CATEGORIES = ["kopi", "non-kopi", "pastry"] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_CATEGORY_LABEL: Record<ProductCategory, string> = {
  kopi: "Kopi",
  "non-kopi": "Non-Kopi",
  pastry: "Pastry",
};

export interface AdminProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image_url: string;
  available: boolean;
  created_at: string;
}

export const BOOKING_STATUSES = ["pending", "confirmed", "done", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  done: "Done",
  cancelled: "Cancelled",
};

// pending kuning, confirmed hijau, done abu, cancelled merah
export const BOOKING_STATUS_BADGE: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  done: "bg-zinc-200 text-zinc-700",
  cancelled: "bg-red-100 text-red-700",
};

export interface AdminBooking {
  id: number;
  customer_name: string;
  whatsapp: string;
  booking_date: string;
  booking_time: string;
  party_size: number;
  notes: string | null;
  status: BookingStatus;
  created_at: string;
}
