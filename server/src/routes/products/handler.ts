import { Request, Response } from "express";
import ProductService from "./service";
import { getProductsByCategorySchema } from "./schema";

export default class ProductsHandler {
  constructor(private productService: ProductService) {
    this.productService = productService;
  }
  getProductsByCategory = async (req: Request, res: Response) => {
    try {
      const { params, query } = getProductsByCategorySchema.parse({
        params: req.params,
        query: req.query,
      });

        const products = await this.productService.getProductsByCategory({
        category: params.category,
        page: query.page,
        pageSize: query.pageSize,
      });

      return res.json(products);
    } catch (error: any) {
      return res.status(400).json({ message: error.errors });
    }
  };
}
