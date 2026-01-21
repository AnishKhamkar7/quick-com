import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};
