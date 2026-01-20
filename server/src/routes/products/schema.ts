import z from "zod";

export const PRODUCT_CATEGORIES = [
  "GROCERIES",
  "FRUITS_VEGETABLES",
  "DAIRY",
  "BEVERAGES",
  "SNACKS",
  "BAKERY",
  "MEAT_SEAFOOD",
  "HOUSEHOLD",
  "PERSONAL_CARE",
] as const;

export type ProductCategoryType = (typeof PRODUCT_CATEGORIES)[number];

export const getProductsByCategorySchema = z.object({
  params: z.object({
    category: z.enum(PRODUCT_CATEGORIES),
  }),
  query: z.object({
    page: z
      .string()
      .transform(Number)
      .refine((n) => n > 0, { message: "page must be >= 1" })
      .default(1),

    pageSize: z
      .string()
      .transform(Number)
      .refine((n) => n > 0 && n <= 100, {
        message: "pageSize must be between 1 and 100",
      })
      .default(10),
  }),
});
