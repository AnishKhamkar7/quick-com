import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { City, OrderStatus } from "@prisma/client";
import {
  WebSocketEvent,
  WebSocketOrderPayload,
  WebSocketStatusUpdatePayload,
  wsJoinCityRoomSchema,
  wsJoinOrderRoomSchema,
} from "../routes/orders/schema";

interface SocketData {
  userId: string;
  userRole: string;
  city?: City;
}

export default class WebSocketService {
  private io: SocketIOServer;

  // Track connected users
  private connectedUsers: Map<string, Socket> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.setupMiddleware();
    this.setupConnectionHandler();
  }

  // ============================================================================
  // MIDDLEWARE SETUP
  // ============================================================================

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: Socket, next) => {
      try {
        // Extract token from handshake auth or query
        const token =
          socket.handshake.auth.token || socket.handshake.query.token;

        if (!token) {
          return next(new Error("Authentication token required"));
        }

        // Verify token and get user data
        // You should implement your own JWT verification logic here
        const userData = await this.verifyToken(token as string);

        if (!userData) {
          return next(new Error("Invalid authentication token"));
        }

        // Attach user data to socket
        socket.data = {
          userId: userData.userId,
          userRole: userData.userRole,
          city: userData.city,
        } as SocketData;

        next();
      } catch (error) {
        console.error("WebSocket authentication error:", error);
        next(new Error("Authentication failed"));
      }
    });
  }

  // ============================================================================
  // CONNECTION HANDLER
  // ============================================================================

  private setupConnectionHandler() {
    this.io.on("connection", (socket: Socket) => {
      const socketData = socket.data as SocketData;
      console.log(
        `User connected: ${socketData.userId} (${socketData.userRole})`,
      );

      // Store socket reference
      this.connectedUsers.set(socketData.userId, socket);

      // Setup event handlers
      this.setupCityRoomHandlers(socket);
      this.setupOrderRoomHandlers(socket);

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socketData.userId}`);
        this.connectedUsers.delete(socketData.userId);
      });
    });
  }

  // ============================================================================
  // CITY ROOM HANDLERS (For delivery partners to receive new orders)
  // ============================================================================

  private setupCityRoomHandlers(socket: Socket) {
    const socketData = socket.data as SocketData;

    // Join city room (for delivery partners)
    socket.on(WebSocketEvent.JOIN_CITY_ROOM, (data) => {
      try {
        const { city } = wsJoinCityRoomSchema.parse(data);

        if (socketData.userRole !== "DELIVERY_PARTNER") {
          socket.emit(WebSocketEvent.ERROR, {
            message: "Only delivery partners can join city rooms",
          });
          return;
        }

        const roomName = this.getCityRoomName(city);
        socket.join(roomName);
        console.log(
          `Delivery partner ${socketData.userId} joined city room: ${roomName}`,
        );

        socket.emit("joined_city_room", { city, room: roomName });
      } catch (error: any) {
        console.error("Join city room error:", error);
        socket.emit(WebSocketEvent.ERROR, {
          message: error.message || "Failed to join city room",
        });
      }
    });

    // Leave city room
    socket.on(WebSocketEvent.LEAVE_CITY_ROOM, (data) => {
      try {
        const { city } = wsJoinCityRoomSchema.parse(data);

        const roomName = this.getCityRoomName(city);
        socket.leave(roomName);

        console.log(`User ${socketData.userId} left city room: ${roomName}`);

        socket.emit("left_city_room", { city, room: roomName });
      } catch (error: any) {
        console.error("Leave city room error:", error);
        socket.emit(WebSocketEvent.ERROR, {
          message: error.message || "Failed to leave city room",
        });
      }
    });
  }

  // ============================================================================
  // ORDER ROOM HANDLERS (For customer and delivery partner communication)
  // ============================================================================

  private setupOrderRoomHandlers(socket: Socket) {
    const socketData = socket.data as SocketData;

    // Join order room
    socket.on(WebSocketEvent.JOIN_ORDER_ROOM, (data) => {
      try {
        const { orderId } = wsJoinOrderRoomSchema.parse(data);

        const roomName = this.getOrderRoomName(orderId);
        socket.join(roomName);

        console.log(
          `User ${socketData.userId} (${socketData.userRole}) joined order room: ${roomName}`,
        );

        socket.emit("joined_order_room", { orderId, room: roomName });
      } catch (error: any) {
        console.error("Join order room error:", error);
        socket.emit(WebSocketEvent.ERROR, {
          message: error.message || "Failed to join order room",
        });
      }
    });

    // Leave order room
    socket.on(WebSocketEvent.LEAVE_ORDER_ROOM, (data) => {
      try {
        const { orderId } = wsJoinOrderRoomSchema.parse(data);

        const roomName = this.getOrderRoomName(orderId);
        socket.leave(roomName);

        console.log(`User ${socketData.userId} left order room: ${roomName}`);

        socket.emit("left_order_room", { orderId, room: roomName });
      } catch (error: any) {
        console.error("Leave order room error:", error);
        socket.emit(WebSocketEvent.ERROR, {
          message: error.message || "Failed to leave order room",
        });
      }
    });
  }

  // ============================================================================
  // PUBLIC METHODS TO EMIT EVENTS
  // ============================================================================

  /**
   * Emit new order to all delivery partners in the city
   */
  emitNewOrderToCity(city: City, orderPayload: WebSocketOrderPayload) {
    const roomName = this.getCityRoomName(city);

    this.io.to(roomName).emit(WebSocketEvent.NEW_ORDER, orderPayload);

    console.log(
      `New order ${orderPayload.orderNumber} emitted to city: ${city}`,
    );
  }

  /**
   * Emit order accepted to customer and remove from city room
   */
  emitOrderAccepted(
    orderId: string,
    orderPayload: WebSocketStatusUpdatePayload,
  ) {
    const roomName = this.getOrderRoomName(orderId);

    this.io.to(roomName).emit(WebSocketEvent.ORDER_ACCEPTED, orderPayload);

    console.log(`Order ${orderId} accepted event emitted`);
  }

  /**
   * Emit order status update to order room (customer and delivery partner)
   */
  emitOrderStatusUpdate(
    orderId: string,
    status: OrderStatus,
    payload: WebSocketStatusUpdatePayload,
  ) {
    const roomName = this.getOrderRoomName(orderId);

    let event: WebSocketEvent;
    switch (status) {
      case OrderStatus.PICKED_UP:
        event = WebSocketEvent.ORDER_PICKED_UP;
        break;
      case OrderStatus.ON_THE_WAY:
        event = WebSocketEvent.ORDER_ON_THE_WAY;
        break;
      case OrderStatus.DELIVERED:
        event = WebSocketEvent.ORDER_DELIVERED;
        break;
      case OrderStatus.CANCELLED:
        event = WebSocketEvent.ORDER_CANCELLED;
        break;
      default:
        event = WebSocketEvent.ORDER_STATUS_UPDATED;
    }

    this.io.to(roomName).emit(event, payload);

    console.log(`Order ${orderId} status updated to ${status}`);
  }

  /**
   * Emit order cancelled by customer to city room
   */
  emitOrderCancelledByCustomer(city: City, orderId: string) {
    const cityRoomName = this.getCityRoomName(city);

    this.io.to(cityRoomName).emit(WebSocketEvent.ORDER_CANCELLED_BY_CUSTOMER, {
      orderId,
      timestamp: new Date(),
    });

    console.log(`Order ${orderId} cancelled by customer in city: ${city}`);
  }

  /**
   * Send direct message to a specific user
   */
  sendToUser(userId: string, event: string, data: any) {
    const socket = this.connectedUsers.get(userId);

    if (socket) {
      socket.emit(event, data);
      console.log(`Event ${event} sent to user ${userId}`);
    } else {
      console.log(`User ${userId} not connected`);
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getCityRoomName(city: City): string {
    return `city:${city}`;
  }

  private getOrderRoomName(orderId: string): string {
    return `order:${orderId}`;
  }

  private async verifyToken(token: string): Promise<{
    userId: string;
    userRole: string;
    city?: City;
  } | null> {
    // Implement your JWT verification logic here
    // This is a placeholder implementation
    try {
      // Example using jsonwebtoken:
      // const jwt = require('jsonwebtoken');
      // const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // For now, returning mock data
      // Replace this with actual JWT verification

      return {
        userId: "mock-user-id",
        userRole: "DELIVERY_PARTNER",
        city: City.MUMBAI,
      };
    } catch (error) {
      console.error("Token verification error:", error);
      return null;
    }
  }

  /**
   * Get Socket.IO instance for external use
   */
  getIO(): SocketIOServer {
    return this.io;
  }
}
