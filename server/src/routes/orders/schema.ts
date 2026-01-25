import { z } from "zod";
import { City, OrderStatus } from "@prisma/client";

export const createOrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

const orderStatusValues = Object.values(OrderStatus) as [
  OrderStatus,
  ...OrderStatus[],
];

const cityValues = Object.values(City) as [City, ...City[]];

export const createOrderSchema = z.object({
  body: z.object({
    deliveryAddress: z
      .string()
      .min(10, "Address must be at least 10 characters"),
    notes: z.string().optional(),
    items: z
      .array(createOrderItemSchema)
      .min(1, "At least one item is required"),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>["body"];

export const acceptOrderSchema = z.object({
  params: z.object({
    orderId: z.string(),
  }),
});

export type AcceptOrderParams = z.infer<typeof acceptOrderSchema>["params"];

export const updateOrderStatusSchema = z.object({
  params: z.object({
    orderId: z.string(),
  }),
  body: z.object({
    status: z.enum(orderStatusValues),
    notes: z.string().optional(),
  }),
});

export type UpdateOrderStatusParams = z.infer<
  typeof updateOrderStatusSchema
>["params"];
export type UpdateOrderStatusBody = z.infer<
  typeof updateOrderStatusSchema
>["body"];

export const getOrderByIdSchema = z.object({
  params: z.object({
    orderId: z.string(),
  }),
});

export const getCustomerOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10),
    status: z.enum(orderStatusValues).optional(),
  }),
});

export const getDeliveryPartnerOrdersSchema = z.object({
  query: z.object({
    city: z.enum(cityValues),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10),
    status: z.enum(orderStatusValues).optional(),
  }),
});

export const getDeliveryPartnerActiveOrderSchema = z.object({
  query: z.object({
    city: z.enum(cityValues),
  }),
});

export const wsJoinCityRoomSchema = z.object({
  city: z.enum(cityValues),
});

export const wsJoinOrderRoomSchema = z.object({
  orderId: z.string(),
});

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  city: City;
  deliveryAddress: string;
  totalAmount: number;
  deliveryFee: number;
  notes?: string;
  createdAt: Date;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  onTheWayAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  customer: {
    id: string;
    name: string;
    phone?: string;
  };
  deliveryPartner?: {
    id: string;
    name: string;
    phone?: string;
    vehicleType?: string;
  };
  items: OrderItemResponse[];
}

export interface PaginatedOrdersResponse {
  data: OrderResponse[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export enum WebSocketEvent {
  // City room events (for available delivery partners)
  NEW_ORDER = "new_order",
  ORDER_CANCELLED_BY_CUSTOMER = "order_cancelled_by_customer",

  // Order room events (between customer and delivery partner)
  ORDER_ACCEPTED = "order_accepted",
  ORDER_PICKED_UP = "order_picked_up",
  ORDER_ON_THE_WAY = "order_on_the_way",
  ORDER_DELIVERED = "order_delivered",
  ORDER_CANCELLED = "order_cancelled",
  ORDER_STATUS_UPDATED = "order_status_updated",

  // Connection events
  JOIN_CITY_ROOM = "join_city_room",
  LEAVE_CITY_ROOM = "leave_city_room",
  JOIN_ORDER_ROOM = "join_order_room",
  LEAVE_ORDER_ROOM = "leave_order_room",

  // Error events
  ERROR = "error",
}

export interface WebSocketOrderPayload {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  city: City;
  deliveryAddress: string;
  totalAmount: number;
  deliveryFee: number;
  notes?: string;
  createdAt: Date;
  customer: {
    name: string;
    phone?: string;
  };
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export interface WebSocketStatusUpdatePayload {
  orderId: string;
  status: OrderStatus;
  notes?: string;
  timestamp: Date;
  deliveryPartner?: {
    name: string;
    phone?: string;
    vehicleType?: string;
  };
}
