import { UserRole } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/token";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("Authenticating cookies ...", req.cookies);
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    console.log("Authenticating with token:", token);

    const payload = await verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Insufficient permissions",
      });
    }

    next();
  };
};

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}
