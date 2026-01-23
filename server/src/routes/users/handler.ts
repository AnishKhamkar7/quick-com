import { NextFunction, Request, Response } from "express";
import { UsersService } from "./service";

export class UsersHandler {
  constructor(private userService: UsersService) {
    this.userService = userService;
  }

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const user = await this.userService.getUserById(userId);
      res.status(200).json({
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
}
