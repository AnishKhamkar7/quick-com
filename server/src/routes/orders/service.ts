import { City, OrderStatus } from "@prisma/client";
import prisma from "../../db";
import {
  CreateOrderInput,
  OrderResponse,
  PaginatedOrdersResponse,
  UpdateOrderStatusBody,
} from "./schema";

export default class OrderService {
  // ============================================================================
  // CREATE ORDER
  // ============================================================================

  async createOrder(
    customerId: string,
    input: CreateOrderInput,
  ): Promise<OrderResponse> {
    // Fetch customer to get city
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { user: true },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Fetch products and validate
    const productIds = input.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        inStock: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new Error("One or more products are not available");
    }

    // Create a map for easy lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate quantities and calculate total
    let totalAmount = 0;
    const orderItems = input.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      };
    });

    // Calculate delivery fee (simple logic, can be enhanced)
    const deliveryFee = totalAmount > 500 ? 0 : 40;
    totalAmount += deliveryFee;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          city: customer.city,
          deliveryAddress: input.deliveryAddress,
          notes: input.notes,
          totalAmount,
          deliveryFee,
          status: OrderStatus.PENDING,
          orderItems: {
            create: orderItems,
          },
          statusHistory: {
            create: {
              status: OrderStatus.PENDING,
              notes: "Order created",
            },
          },
        },
        include: {
          customer: {
            include: { user: true },
          },
          orderItems: {
            include: { product: true },
          },
        },
      });

      // Update product quantities
      for (const item of input.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return this.mapToOrderResponse(order);
  }

  async cancelOrderByCustomer(
    orderId: string,
    customerId: string,
  ): Promise<OrderResponse> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { include: { user: true } },
        orderItems: { include: { product: true } },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Authorization: order must belong to this customer
    if (order.customerId !== customerId) {
      throw new Error("You are not authorized to cancel this order");
    }

    // Business rule: only PENDING orders can be cancelled by customer
    if (order.status !== OrderStatus.PENDING) {
      throw new Error("Only pending orders can be cancelled");
    }

    const cancelledOrder = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
        },
        include: {
          customer: { include: { user: true } },
          deliveryPartner: { include: { user: true } },
          orderItems: { include: { product: true } },
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.CANCELLED,
          notes: "Order cancelled by customer",
        },
      });

      return updatedOrder;
    });

    return this.mapToOrderResponse(cancelledOrder);
  }

  async acceptOrder(
    orderId: string,
    deliveryPartnerId: string,
  ): Promise<OrderResponse> {
    const order = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          deliveryPartnerId,
          status: OrderStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
        include: {
          customer: {
            include: { user: true },
          },
          deliveryPartner: {
            include: { user: true },
          },
          orderItems: {
            include: { product: true },
          },
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.ACCEPTED,
          notes: `Order accepted by ${deliveryPartnerId}`,
        },
      });

      await tx.deliveryPartner.update({
        where: { id: deliveryPartnerId },
        data: { status: "BUSY" },
      });

      return updatedOrder;
    });

    return this.mapToOrderResponse(order);
  }

  // ============================================================================
  // UPDATE ORDER STATUS
  // ============================================================================

  async updateOrderStatus(
    orderId: string,
    deliveryPartnerId: string,
    input: UpdateOrderStatusBody,
  ): Promise<OrderResponse> {
    // Verify order exists and belongs to this delivery partner
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      throw new Error("Order not found");
    }

    if (existingOrder.deliveryPartnerId !== deliveryPartnerId) {
      throw new Error("You are not authorized to update this order");
    }

    // Validate status transition
    this.validateStatusTransition(existingOrder.status, input.status);

    // Prepare update data
    const updateData: any = {
      status: input.status,
    };

    const now = new Date();
    switch (input.status) {
      case OrderStatus.PICKED_UP:
        updateData.pickedUpAt = now;
        break;
      case OrderStatus.ON_THE_WAY:
        updateData.onTheWayAt = now;
        break;
      case OrderStatus.DELIVERED:
        updateData.deliveredAt = now;
        break;
      case OrderStatus.CANCELLED:
        updateData.cancelledAt = now;
        break;
    }

    // Update order
    const order = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          customer: {
            include: { user: true },
          },
          deliveryPartner: {
            include: { user: true },
          },
          orderItems: {
            include: { product: true },
          },
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: input.status,
          notes: input.notes,
        },
      });

      // If order is delivered or cancelled, set delivery partner to available
      if (
        input.status === OrderStatus.DELIVERED ||
        input.status === OrderStatus.CANCELLED
      ) {
        await tx.deliveryPartner.update({
          where: { id: deliveryPartnerId },
          data: { status: "AVAILABLE" },
        });
      }

      return updatedOrder;
    });

    return this.mapToOrderResponse(order);
  }

  // ============================================================================
  // GET ORDERS
  // ============================================================================

  async getOrderById(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }

  async getCustomerOrders(
    customerId: string,
    page: number,
    pageSize: number,
    status?: OrderStatus,
  ): Promise<PaginatedOrdersResponse> {
    const skip = (page - 1) * pageSize;

    const where: any = { customerId };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            include: { user: true },
          },
          deliveryPartner: {
            include: { user: true },
          },
          orderItems: {
            include: { product: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders.map(this.mapToOrderResponse),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getDeliveryPartnerOrders({ city }: { city: City }) {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          status: "PENDING",
          city,
        },
        orderBy: { createdAt: "desc" },
        include: {
          customer: { include: { user: true } },
          deliveryPartner: { include: { user: true } },
          orderItems: { include: { product: true } },
        },
      }),
      prisma.order.count({
        where: {
          status: "PENDING",
          city,
        },
      }),
    ]);

    return {
      data: orders.map(this.mapToOrderResponse),
      meta: {
        total,
      },
    };
  }

  async getDeliveryPartnerActiveOrder({
    deliveryPartnerId,
    city,
  }: {
    deliveryPartnerId: string;
    city: City;
  }): Promise<OrderResponse | null> {
    const order = await prisma.order.findFirst({
      where: {
        deliveryPartnerId,
        city,
        status: {
          in: [
            OrderStatus.ACCEPTED,
            OrderStatus.PICKED_UP,
            OrderStatus.ON_THE_WAY,
          ],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        customer: { include: { user: true } },
        deliveryPartner: { include: { user: true } },
        orderItems: { include: { product: true } },
      },
    });

    if (!order) {
      return null;
    }

    return this.mapToOrderResponse(order);
  }
  async getDeliveryPartnerDeliveredHistoryOrders({
    deliveryPartnerId,
    city,
    page,
    pageSize,
  }: {
    deliveryPartnerId: string;
    city: City;
    page: number;
    pageSize: number;
  }): Promise<PaginatedOrdersResponse> {
    const skip = (page - 1) * pageSize;

    const where = {
      deliveryPartnerId,
      city,
      status: OrderStatus.DELIVERED,
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { deliveredAt: "desc" },
        include: {
          customer: { include: { user: true } },
          deliveryPartner: { include: { user: true } },
          orderItems: { include: { product: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders.map(this.mapToOrderResponse),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    const count = await prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
        },
      },
    });

    const sequence = (count + 1).toString().padStart(4, "0");
    return `ORD${year}${month}${day}${sequence}`;
  }

  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
      [OrderStatus.ACCEPTED]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
      [OrderStatus.PICKED_UP]: [OrderStatus.ON_THE_WAY, OrderStatus.CANCELLED],
      [OrderStatus.ON_THE_WAY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  private mapToOrderResponse(order: any): OrderResponse {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      city: order.city,
      deliveryAddress: order.deliveryAddress,
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee,
      notes: order.notes,
      createdAt: order.createdAt,
      acceptedAt: order.acceptedAt,
      pickedUpAt: order.pickedUpAt,
      onTheWayAt: order.onTheWayAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      customer: {
        id: order.customer.id,
        name: order.customer.user.name,
        phone: order.customer.user.phone,
      },
      deliveryPartner: order.deliveryPartner
        ? {
            id: order.deliveryPartner.id,
            name: order.deliveryPartner.user.name,
            phone: order.deliveryPartner.user.phone,
            vehicleType: order.deliveryPartner.vehicleType,
          }
        : undefined,
      items: order.orderItems.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
        category: item.product.category,
      })),
    };
  }
}
