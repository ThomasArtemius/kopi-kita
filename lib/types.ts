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
