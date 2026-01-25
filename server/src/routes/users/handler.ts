import { NextFunction, Request, Response } from "express";
import { UsersService } from "./service";
import { updatedProfileSchema } from "./schema";

export class UsersHandler {
  constructor(private userService: UsersService) {
    this.userService = userService;
  }

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;

      const user = await this.userService.getUserById(userId!);
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, role } = req.user!;
      const updateData = updatedProfileSchema.parse({ body: req.body }).body;

      if (role === "CUSTOMER" && updateData.address) {
        const customer = await this.userService.updateCustomerProfile(userId, {
          address: updateData.address,
        });

        return res.status(200).json({
          success: true,
          data: customer,
        });
      }

      if (role === "DELIVERY_PARTNER" && updateData.vehicleType) {
        const deliveryPartner =
          await this.userService.updateDeliveryPartnerProfile(userId, {
            vehicleType: updateData.vehicleType,
          });
        return res.status(200).json({
          success: true,
          data: deliveryPartner,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }
  };
}
