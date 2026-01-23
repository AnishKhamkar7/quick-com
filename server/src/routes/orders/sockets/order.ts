import { OrderStatus } from "@prisma/client";
import OrderService from "../service";
import { socket } from "../../../server";
import {
  CreateOrderInput,
  OrderResponse,
  UpdateOrderStatusBody,
  WebSocketOrderPayload,
  WebSocketStatusUpdatePayload,
} from "../schema";

export default class OrderWebSocketService {
  constructor(private orderService: OrderService) {}

  async createOrder(
    customerId: string,
    input: CreateOrderInput,
  ): Promise<OrderResponse> {
    const order = await this.orderService.createOrder(customerId, input);

    const wsPayload: WebSocketOrderPayload = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      city: order.city,
      deliveryAddress: order.deliveryAddress,
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee,
      notes: order.notes,
      createdAt: order.createdAt,
      customer: {
        name: order.customer.name,
        phone: order.customer.phone,
      },
      items: order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    socket.emitNewOrderToCity(order.city, wsPayload);

    return order;
  }

  async acceptOrder(
    orderId: string,
    deliveryPartnerId: string,
  ): Promise<OrderResponse> {
    const order = await this.orderService.acceptOrder(
      orderId,
      deliveryPartnerId,
    );

    const wsPayload: WebSocketStatusUpdatePayload = {
      orderId: order.id,
      status: order.status,
      timestamp: order.acceptedAt!,
      deliveryPartner: order.deliveryPartner
        ? {
            name: order.deliveryPartner.name,
            phone: order.deliveryPartner.phone,
            vehicleType: order.deliveryPartner.vehicleType,
          }
        : undefined,
    };

    socket.emitOrderAccepted(order.id, wsPayload);

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    deliveryPartnerId: string,
    input: UpdateOrderStatusBody,
  ): Promise<OrderResponse> {
    const order = await this.orderService.updateOrderStatus(
      orderId,
      deliveryPartnerId,
      input,
    );

    let timestamp: Date;
    switch (input.status) {
      case OrderStatus.PICKED_UP:
        timestamp = order.pickedUpAt!;
        break;
      case OrderStatus.ON_THE_WAY:
        timestamp = order.onTheWayAt!;
        break;
      case OrderStatus.DELIVERED:
        timestamp = order.deliveredAt!;
        break;
      case OrderStatus.CANCELLED:
        timestamp = order.cancelledAt!;
        break;
      default:
        timestamp = new Date();
    }

    const wsPayload: WebSocketStatusUpdatePayload = {
      orderId: order.id,
      status: order.status,
      notes: input.notes,
      timestamp,
      deliveryPartner: order.deliveryPartner
        ? {
            name: order.deliveryPartner.name,
            phone: order.deliveryPartner.phone,
            vehicleType: order.deliveryPartner.vehicleType,
          }
        : undefined,
    };

    socket.emitOrderStatusUpdate(order.id, order.status, wsPayload);

    return order;
  }

  async cancelOrderByCustomer(
    orderId: string,
    customerId: string,
  ): Promise<OrderResponse> {
    const order = await this.orderService.getOrderById(
      orderId,
      customerId,
      "CUSTOMER",
    );

    if (order.status !== OrderStatus.PENDING) {
      throw new Error("Only pending orders can be cancelled");
    }

    const cancelledOrder = await this.orderService.updateOrderStatus(
      orderId,
      order.deliveryPartner?.id || "",
      {
        status: OrderStatus.CANCELLED,
        notes: "Cancelled by customer",
      },
    );

    socket.emitOrderCancelledByCustomer(order.city, orderId);

    if (order.deliveryPartner) {
      const wsPayload: WebSocketStatusUpdatePayload = {
        orderId: order.id,
        status: OrderStatus.CANCELLED,
        notes: "Cancelled by customer",
        timestamp: cancelledOrder.cancelledAt!,
      };

      socket.emitOrderStatusUpdate(order.id, OrderStatus.CANCELLED, wsPayload);
    }

    return cancelledOrder;
  }

  async getOrderById(orderId: string, userId: string, userRole: string) {
    return this.orderService.getOrderById(orderId, userId, userRole);
  }

  async getCustomerOrders(
    customerId: string,
    page: number,
    pageSize: number,
    status?: OrderStatus,
  ) {
    return this.orderService.getCustomerOrders(
      customerId,
      page,
      pageSize,
      status,
    );
  }

  async getDeliveryPartnerOrders(
    deliveryPartnerId: string,
    page: number,
    pageSize: number,
    status?: OrderStatus,
  ) {
    return this.orderService.getDeliveryPartnerOrders(
      deliveryPartnerId,
      page,
      pageSize,
      status,
    );
  }
}
