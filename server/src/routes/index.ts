import { Router } from "express";
import auth from "./auth";
import products from "./products";

const router = Router();

router.use("/auth", auth);
router.use("/products", products);

export default router;
