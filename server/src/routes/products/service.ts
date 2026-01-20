import { PrismaClient, ProductCategory } from "@prisma/client";
import prisma from "../../db";

interface GetProductsByCategoryInput {
  category: ProductCategory;
  page: number;
  pageSize: number;
}

export default class ProductService {
  async getProductsByCategory({
    category,
    page,
    pageSize,
  }: GetProductsByCategoryInput) {
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          category,
          inStock: true,
        },
        skip,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.product.count({
        where: {
          category,
          inStock: true,
        },
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
