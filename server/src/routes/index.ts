import { Router } from "express";
import auth from "./auth";
import products from "./products";
import orders from "./orders";
import users from "./users";
import { Request, Response } from "express";

const router = Router();

router.use("/auth", auth);
router.use("/products", products);
router.use("/orders", orders);
router.use("/users", users);
router.use("health", (_req: Request, res: Response) => {
  return res.status(200).json({
    message: "API IS WORKING",
  });
});

export default router;
