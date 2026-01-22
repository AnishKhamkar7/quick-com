import { Router } from "express";
import auth from "./auth";
import products from "./products";
import orders from "./orders";

const router = Router();

router.use("/auth", auth);
router.use("/products", products);
router.use("/orders", orders);

export default router;
