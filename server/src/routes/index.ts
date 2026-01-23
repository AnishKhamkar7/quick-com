import { Router } from "express";
import auth from "./auth";
import products from "./products";
import orders from "./orders";
import users from "./users";

const router = Router();

router.use("/auth", auth);
router.use("/products", products);
router.use("/orders", orders);
router.use("/users", users);

export default router;
