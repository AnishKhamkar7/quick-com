import { Request, Response } from "express";
import OrderWebSocketService from "./sockets/order";
import {
  createOrderSchema,
  acceptOrderSchema,
  updateOrderStatusSchema,
  getOrderByIdSchema,
  getCustomerOrdersSchema,
  getDeliveryPartnerOrdersSchema,
} from "./schema";
import { UsersService } from "../users/service";

export default class OrderHandlerIntegrated {
  constructor(
    private orderWsService: OrderWebSocketService,
    private userService: UsersService,
  ) {
    this.userService = userService;
    this.orderWsService = orderWsService;
  }
  createOrder = async (req: Request, res: Response) => {
    try {
      const { body } = createOrderSchema.parse({ body: req.body });

      const userId = req.user!.userId; 
      const userRole = req.user!.role;

      if (userRole !== "CUSTOMER") {
        return res
          .status(403)
          .json({ message: "Only customers can create orders" });
      }

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

      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      if (userRole !== "DELIVERY_PARTNER") {
        return res
          .status(403)
          .json({ message: "Only delivery partners can accept orders" });
      }

      const deliveryPartner =
        await this.userService.getDeliveryPartnerByUserId(userId);
      if (!deliveryPartner) {
        return res
          .status(404)
          .json({ message: "Delivery partner profile not found" });
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

      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      if (userRole !== "DELIVERY_PARTNER") {
        return res.status(403).json({
          message: "Only delivery partners can update order status",
        });
      }

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

      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

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

      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

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

  // ============================================================================
  // GET CUSTOMER ORDERS
  // ============================================================================

  getCustomerOrders = async (req: Request, res: Response) => {
    try {
      const { query } = getCustomerOrdersSchema.parse({ query: req.query });

      const userId = req.user!.userId;
      const userRole = req.user!.role;

      if (userRole !== "CUSTOMER") {
        return res
          .status(403)
          .json({ message: "Only customers can view their orders" });
      }

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

  // ============================================================================
  // GET DELIVERY PARTNER ORDERS
  // ============================================================================

  getDeliveryPartnerOrders = async (req: Request, res: Response) => {
    try {
      const { query } = getDeliveryPartnerOrdersSchema.parse({
        query: req.query,
      });

      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      if (userRole !== "DELIVERY_PARTNER") {
        return res.status(403).json({
          message: "Only delivery partners can view their orders",
        });
      }

      const deliveryPartner =
        await this.userService.getDeliveryPartnerByUserId(userId);
      if (!deliveryPartner) {
        return res
          .status(404)
          .json({ message: "Delivery partner profile not found" });
      }

      const orders = await this.orderWsService.getDeliveryPartnerOrders(
        deliveryPartner.id,
        query.page,
        query.pageSize,
        query.status,
      );

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
}
