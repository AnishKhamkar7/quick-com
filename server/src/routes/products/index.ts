import { Router } from "express";
import ProductService from "./service";
import ProductsHandler from "./handler";

const router = Router();

const productService = new ProductService();
const productHandler = new ProductsHandler(productService);

router.get("/category/:category", productHandler.getProductsByCategory);
export default router;
