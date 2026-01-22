import jwt from "jsonwebtoken";
import { City, UserRole } from "@prisma/client";

interface JWTPayload {
  userId: string;
  role: UserRole;
  city?: City;
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
