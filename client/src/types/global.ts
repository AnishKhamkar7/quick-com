export const PRODUCT_CATEGORIES = {
  GROCERIES: "GROCERIES",
  FRUITS_VEGETABLES: "FRUITS_VEGETABLES",
  DAIRY: "DAIRY",
  BEVERAGES: "BEVERAGES",
  SNACKS: "SNACKS",
  BAKERY: "BAKERY",
  MEAT_SEAFOOD: "MEAT_SEAFOOD",
  HOUSEHOLD: "HOUSEHOLD",
  PERSONAL_CARE: "PERSONAL_CARE",
} as const;

export type ProductCategory =
  (typeof PRODUCT_CATEGORIES)[keyof typeof PRODUCT_CATEGORIES];

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  category: ProductCategory;
  inStock: boolean;
}
