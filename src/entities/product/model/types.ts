export const PRODUCT_CATEGORIES = [
  "electronics",
  "apparel",
  "home",
  "beauty",
  "sports",
  "toys",
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_STATUSES = ["active", "draft", "discontinued"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  status: ProductStatus;
  /** Price in cents. */
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}
