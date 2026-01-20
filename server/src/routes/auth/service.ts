import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../db";
import { City } from "@prisma/client";

interface Register {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
  address?: string;
  vehicleType?: string;
  city: City;
}

interface Login {
  email: string;
  password: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  token: string;
}

export class AuthService {
  private jwtSecret =
    process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

  async register(data: Register): Promise<AuthResponse> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          phone: data.phone,

          role: data.role,
          ...(data.role === UserRole.CUSTOMER && {
            customer: {
              create: {
                address: data.address,
                city: data.city,
              },
            },
          }),
          ...(data.role === UserRole.DELIVERY_PARTNER && {
            deliveryPartner: {
              create: {
                vehicleType: data.vehicleType,
                city: data.city,
              },
            },
          }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        user,
        token,
      };
    } catch (error) {
      throw new Error("Registration failed");
    }
  }

  async login(data: Login): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        customer: {
          select: {
            id: true,
            address: true,
          },
        },
        deliveryPartner: {
          select: {
            id: true,
            vehicleType: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async refreshToken(oldToken: string): Promise<{ token: string }> {
    const payload = await this.verifyToken(oldToken);

    const newToken = this.generateToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return { token: newToken };
  }

  private generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: "7d",
    });
  }
}
