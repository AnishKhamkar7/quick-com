import { Router } from "express";
import { AuthService } from "./service";
import { AuthHandler } from "./handler";
import { authenticate } from "../../middleware/auth";

const authService = new AuthService();

const authHandler = new AuthHandler(authService);

const router = Router();

router.post("/register", authHandler.register);

router.post("/login", authHandler.login);

router.get("/profile", authenticate, authHandler.getProfile);

router.post("/logout", authHandler.logout);

export default router;
