import { Router } from "express";
import OrderHandler from "./handler";
import OrderWebSocketService from "./sockets/order";
import { authenticate, authorize } from "../../middleware/auth";
import OrderService from "./service";
import { UsersService } from "../users/service";
import { UserRole } from "@prisma/client";

const router = Router();

const orderService = new OrderService();
const orderWsService = new OrderWebSocketService(orderService);
const userService = new UsersService();
const orderHandler = new OrderHandler(
  orderWsService,
  userService,
  orderService,
);

router.post(
  "/",
  authenticate,
  authorize(UserRole.CUSTOMER),
  orderHandler.createOrder,
);

router.get(
  "/customer/my-orders",
  authenticate,
  authorize(UserRole.CUSTOMER),
  orderHandler.getCustomerOrders,
);

router.post(
  "/:orderId/accept",
  authenticate,
  authorize(UserRole.DELIVERY_PARTNER),
  orderHandler.acceptOrder,
);

router.patch(
  "/:orderId/status",
  authenticate,
  authorize(UserRole.DELIVERY_PARTNER),
  orderHandler.updateOrderStatus,
);

router.get(
  "/delivery-partner/my-orders",
  authenticate,
  authorize(UserRole.DELIVERY_PARTNER),
  orderHandler.getDeliveryPartnerOrders,
);

router.get(
  "/:orderId",
  authenticate,
  authorize(UserRole.CUSTOMER, UserRole.DELIVERY_PARTNER),
  orderHandler.getOrderById,
);

router.get(
  "/delivery-partner/active",
  authenticate,
  authorize(UserRole.DELIVERY_PARTNER),
  orderHandler.getDeliveryPartnerActiveOrder,
);

export default router;
