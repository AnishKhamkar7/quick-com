import { Router } from "express";
import { UsersHandler } from "./handler";
import { UsersService } from "./service";
import { authenticate } from "../../middleware/auth";

const router = Router();

const userService = new UsersService();
const usersHandler = new UsersHandler(userService);

router.get("/profile", authenticate, usersHandler.getProfile);

export default router;