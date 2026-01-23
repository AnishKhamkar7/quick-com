export const PRODUCT_CATEGORIES = {
  GROCERIES: "GROCERIES",
  FRUITS_VEGETABLES: "FRUITS_VEGETABLES",
  DAIRY: "DAIRY",
  BEVERAGES: "BEVERAGES",
  SNACKS: "SNACKS",
  BAKERY: "BAKERY",
  MEAT_SEAFOOD: "MEAT_SEAFOOD",
  HOUSEHOLD: "HOUSEHOLD",
  PERSONAL_CARE: "PERSONAL_CARE",
} as const;

export type ProductCategory =
  (typeof PRODUCT_CATEGORIES)[keyof typeof PRODUCT_CATEGORIES];

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  category: ProductCategory;
  inStock: boolean;
}

export const ORDER_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  PICKED_UP: "PICKED_UP",
  ON_THE_WAY: "ON_THE_WAY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const CITY = {
  MUMBAI: "MUMBAI",
  DELHI: "DELHI",
  BENGALURU: "BENGALURU",
  HYDERABAD: "HYDERABAD",
  CHENNAI: "CHENNAI",
  PUNE: "PUNE",
};

export type City = (typeof CITY)[keyof typeof CITY];

export const WebSocketEvent = {
  NEW_ORDER: "new_order",
  ORDER_CANCELLED_BY_CUSTOMER: "order_cancelled_by_customer",

  ORDER_ACCEPTED: "order_accepted",
  ORDER_PICKED_UP: "order_picked_up",
  ORDER_ON_THE_WAY: "order_on_the_way",
  ORDER_DELIVERED: "order_delivered",
  ORDER_CANCELLED: "order_cancelled",
  ORDER_STATUS_UPDATED: "order_status_updated",

  JOIN_CITY_ROOM: "join_city_room",
  LEAVE_CITY_ROOM: "leave_city_room",
  JOIN_ORDER_ROOM: "join_order_room",
  LEAVE_ORDER_ROOM: "leave_order_room",

  ERROR: "error",
} as const;

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

export interface WebSocketContextType {
  isConnected: boolean;
  joinOrderRoom: (orderId: string) => void;
  leaveOrderRoom: (orderId: string) => void;
  joinCityRoom: (city: City) => void;
  leaveCityRoom: (city: City) => void;
}
