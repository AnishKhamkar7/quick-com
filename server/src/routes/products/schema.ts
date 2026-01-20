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

export const getAllProductsSchema = z.object({
  query: z.object({
    category: z.enum(PRODUCT_CATEGORIES).optional(),
    inStock: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional(),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.number().positive(),
    imageUrl: z.string().optional(),
    category: z.enum(PRODUCT_CATEGORIES),
    inStock: z.boolean().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    imageUrl: z.string().optional(),
    category: z.enum(PRODUCT_CATEGORIES).optional(),
    inStock: z.boolean().optional(),
  }),
});
