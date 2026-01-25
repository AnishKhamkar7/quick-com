import { Request, Response } from "express";
import OrderWebSocketService from "./sockets/order";
import {
  createOrderSchema,
  acceptOrderSchema,
  updateOrderStatusSchema,
  getOrderByIdSchema,
  getCustomerOrdersSchema,
  getDeliveryPartnerOrdersSchema,
  getDeliveryPartnerActiveOrderSchema,
  getDeliveryPartnerDeliveredHistorySchema,
} from "./schema";
import { UsersService } from "../users/service";
import OrderService from "./service";
import { OrderStatus } from "@prisma/client";

export default class OrderHandlerIntegrated {
  constructor(
    private orderWsService: OrderWebSocketService,
    private userService: UsersService,
    private orderService: OrderService,
  ) {
    this.userService = userService;
    this.orderWsService = orderWsService;
    this.orderService = orderService;
  }
  createOrder = async (req: Request, res: Response) => {
    try {
      const { body } = createOrderSchema.parse({ body: req.body });

      const userId = req.user!.userId;

      const customer = await this.userService.getCustomerByUserId(userId);
      if (!customer) {
        return res.status(404).json({ message: "Customer profile not found" });
      }

      const order = await this.orderWsService.createOrder(customer.id, body);

      return res.status(201).json({
        message: "Order created successfully",
        data: order,
      });
    } catch (error: any) {
      console.error("Create order error:", error);
      if (error.errors) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }
      return res
        .status(400)
        .json({ message: error.message || "Failed to create order" });
    }
  };

  acceptOrder = async (req: Request, res: Response) => {
    try {
      const { params } = acceptOrderSchema.parse({ params: req.params });

      const userId = req.user?.userId;

      const deliveryPartner = await this.userService.getDeliveryPartnerByUserId(
        userId!,
      );

      const existingOrder = await this.orderService.getOrderById(
        params.orderId,
      );

      if (!existingOrder) {
        throw new Error("Order not found");
      }

      if (existingOrder.status !== OrderStatus.PENDING) {
        throw new Error("Order is no longer available for acceptance");
      }

      if (existingOrder.deliveryPartnerId) {
        throw new Error("Order already assigned to another delivery partner");
      }

      if (!deliveryPartner) {
        return res
          .status(404)
          .json({ message: "Delivery partner profile not found" });
      }
      if (!deliveryPartner) {
        throw new Error("Delivery partner not found");
      }

      if (deliveryPartner.status !== "AVAILABLE") {
        throw new Error("Delivery partner is not available");
      }

      if (deliveryPartner.city !== existingOrder.city) {
        throw new Error(
          "Delivery partner is not in the same city as the order",
        );
      }
      const order = await this.orderWsService.acceptOrder(
        params.orderId,
        deliveryPartner.id,
      );

      return res.json({
        message: "Order accepted successfully",
        data: order,
      });
    } catch (error: any) {
      console.error("Accept order error:", error);
      if (error.errors) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }
      return res
        .status(400)
        .json({ message: error.message || "Failed to accept order" });
    }
  };

  updateOrderStatus = async (req: Request, res: Response) => {
    try {
      const { params, body } = updateOrderStatusSchema.parse({
        params: req.params,
        body: req.body,
      });

      const userId = req.user!.userId;

      const deliveryPartner =
        await this.userService.getDeliveryPartnerByUserId(userId);
      if (!deliveryPartner) {
        return res
          .status(404)
          .json({ message: "Delivery partner profile not found" });
      }

      const order = await this.orderWsService.updateOrderStatus(
        params.orderId,
        deliveryPartner.id,
        body,
      );

      return res.json({
        message: "Order status updated successfully",
        data: order,
      });
    } catch (error: any) {
      console.error("Update order status error:", error);
      if (error.errors) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }
      return res.status(400).json({
        message: error.message || "Failed to update order status",
      });
    }
  };

  cancelOrder = async (req: Request, res: Response) => {
    try {
      const { params } = getOrderByIdSchema.parse({ params: req.params });

      const userId = req.user!.userId;
      const userRole = req.user!.role;

      if (userRole !== "CUSTOMER") {
        return res
          .status(403)
          .json({ message: "Only customers can cancel their orders" });
      }

      const customer = await this.userService.getCustomerByUserId(userId);
      if (!customer) {
        return res.status(404).json({ message: "Customer profile not found" });
      }

      const order = await this.orderWsService.cancelOrderByCustomer(
        params.orderId,
        customer.id,
      );

      return res.json({
        message: "Order cancelled successfully",
        data: order,
      });
    } catch (error: any) {
      console.error("Cancel order error:", error);
      if (error.errors) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }
      return res.status(400).json({
        message: error.message || "Failed to cancel order",
      });
    }
  };

  getOrderById = async (req: Request, res: Response) => {
    try {
      const { params } = getOrderByIdSchema.parse({ params: req.params });

      const userId = req.user!.userId;
      const userRole = req.user!.role;

      const order = await this.orderWsService.getOrderById(
        params.orderId,
        userId,
        userRole,
      );

      return res.json({
        data: order,
      });
    } catch (error: any) {
      console.error("Get order error:", error);
      if (error.errors) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }
      if (error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes("Unauthorized")) {
        return res.status(403).json({ message: error.message });
      }
      return res
        .status(400)
        .json({ message: error.message || "Failed to get order" });
    }
  };

  getCustomerOrders = async (req: Request, res: Response) => {
    try {
      const { query } = getCustomerOrdersSchema.parse({
        query: req.query,
      });

      const userId = req.user!.userId;
      const customer = await this.userService.getCustomerByUserId(userId);

      if (!customer) {
        return res.status(404).json({ message: "Customer profile not found" });
      }

      const orders = await this.orderWsService.getCustomerOrders(
        customer.id,
        query.page,
        query.pageSize,
        query.status,
      );

      return res.json(orders);
    } catch (error: any) {
      console.error("Get customer orders error:", error);
      if (error.errors) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }
      return res.status(400).json({
        message: error.message || "Failed to get customer orders",
      });
    }
  };

  getDeliveryPartnerOrders = async (req: Request, res: Response) => {
    try {
      const { query } = getDeliveryPartnerOrdersSchema.parse({
        query: req.query,
      });

      const userId = req.user!.userId;

      const deliveryPartner =
        await this.userService.getDeliveryPartnerByUserId(userId);
      if (!deliveryPartner) {
        return res
          .status(404)
          .json({ message: "Delivery partner profile not found" });
      }

      if (deliveryPartner.city !== query.city) {
        return res.status(403).json({
          message: "You are not allowed to access orders for this city",
        });
      }

      const orders = await this.orderService.getDeliveryPartnerOrders({
        deliveryPartnerId: deliveryPartner.id,
        page: query.page,
        pageSize: query.pageSize,
        status: query.status,
        city: query.city,
      });

      return res.json(orders);
    } catch (error: any) {
      console.error("Get delivery partner orders error:", error);
      if (error.errors) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }
      return res.status(400).json({
        message: error.message || "Failed to get delivery partner orders",
      });
    }
  };
  getDeliveryPartnerActiveOrder = async (req: Request, res: Response) => {
    try {
      const { query } = getDeliveryPartnerActiveOrderSchema.parse({
        query: req.query,
      });

      const userId = req.user!.userId;

      const deliveryPartner =
        await this.userService.getDeliveryPartnerByUserId(userId);

      if (!deliveryPartner) {
        return res
          .status(404)
          .json({ message: "Delivery partner profile not found" });
      }

      if (deliveryPartner.city !== query.city) {
        return res.status(403).json({
          message: "You are not allowed to access orders for this city",
        });
      }

      const order = await this.orderService.getDeliveryPartnerActiveOrder({
        deliveryPartnerId: deliveryPartner.id,
        city: query.city,
      });

      return res.json(order);
    } catch (error: any) {
      console.error("Get delivery partner active order error:", error);

      if (error.errors) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }

      return res.status(400).json({
        message: error.message || "Failed to get active order",
      });
    }
  };

  getDeliveryPartnerDeliveredHistoryOrders = async (
    req: Request,
    res: Response,
  ) => {
    try {
      const { query } = getDeliveryPartnerDeliveredHistorySchema.parse({
        query: req.query,
      });

      const userId = req.user!.userId;

      const deliveryPartner =
        await this.userService.getDeliveryPartnerByUserId(userId);

      if (!deliveryPartner) {
        return res
          .status(404)
          .json({ message: "Delivery partner profile not found" });
      }

      if (deliveryPartner.city !== query.city) {
        return res.status(403).json({
          message: "You are not allowed to access orders for this city",
        });
      }

      const orders =
        await this.orderService.getDeliveryPartnerDeliveredHistoryOrders({
          deliveryPartnerId: deliveryPartner.id,
          city: query.city,
          page: query.page,
          pageSize: query.pageSize,
        });

      return res.json(orders);
    } catch (error: any) {
      console.error(
        "Get delivery partner delivered history orders error:",
        error,
      );

      if (error.errors) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }

      return res.status(400).json({
        message:
          error.message || "Failed to get delivery partner delivered history",
      });
    }
  };
}
