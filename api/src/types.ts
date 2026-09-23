export const PRODUCT_CATEGORIES = ["kopi", "non-kopi", "pastry"] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image_url: string;
  available: boolean;
  created_at: string;
}

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "done",
  "cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface Booking {
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
