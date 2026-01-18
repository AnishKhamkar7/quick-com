import { Router } from "express";
import { AuthService } from "./service";
import { AuthHandler, AuthMiddleware } from "./handler";

const authService = new AuthService();

const authHandler = new AuthHandler(authService);
const authMiddleware = new AuthMiddleware(authService);

const router = Router();

router.post("/register", authHandler.register);

router.post("/login", authHandler.login);

router.get("/profile", authMiddleware.authenticate, authHandler.getProfile);

router.post("/logout", authHandler.logout);

router.post("/refresh", authHandler.refreshToken);

export { router as authRouter, authMiddleware };
export default router;
