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
import { verifyToken } from "./token";

interface SocketData {
  userId: string;
  userRole: string;
  city?: City;
}

export default class WebSocketService {
  private io: SocketIOServer;

  private connectedUsers: Map<string, Set<Socket>> = new Map();

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

  private setupMiddleware() {
    this.io.use(async (socket: Socket, next) => {
      try {
        const token =
          socket.handshake.auth.token ||
          socket.handshake.query.token ||
          socket.handshake.headers.cookie
            ?.split("; ")
            .find((c) => c.startsWith("token="))
            ?.split("=")[1];

        if (!token) {
          return next(new Error("Authentication token required"));
        }

        const userData = await this.verifyToken(token as string);

        if (!userData) {
          return next(new Error("Invalid authentication token"));
        }

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

  private setupConnectionHandler() {
    this.io.on("connection", (socket: Socket) => {
      const socketData = socket.data as SocketData;
      console.log(
        `User connected: ${socketData.userId} (${socketData.userRole})`,
      );

      const sockets =
        this.connectedUsers.get(socketData.userId) ?? new Set<Socket>();

      sockets.add(socket);
      this.connectedUsers.set(socketData.userId, sockets);

      this.setupCityRoomHandlers(socket);
      this.setupOrderRoomHandlers(socket);

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socketData.userId}`);
        const sockets = this.connectedUsers.get(socketData.userId);

        if (sockets) {
          sockets.delete(socket);
          if (sockets.size === 0) {
            this.connectedUsers.delete(socketData.userId);
          }
        }
      });
    });
  }

  private setupCityRoomHandlers(socket: Socket) {
    const socketData = socket.data as SocketData;

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

  private setupOrderRoomHandlers(socket: Socket) {
    const socketData = socket.data as SocketData;

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

  emitNewOrderToCity(city: City, orderPayload: WebSocketOrderPayload) {
    const roomName = this.getCityRoomName(city);

    this.io.to(roomName).emit(WebSocketEvent.NEW_ORDER, orderPayload);

    console.log(
      `New order ${orderPayload.orderNumber} emitted to city: ${city}`,
    );
  }

  emitOrderAccepted(
    orderId: string,
    orderPayload: WebSocketStatusUpdatePayload,
  ) {
    const roomName = this.getOrderRoomName(orderId);

    this.io.to(roomName).emit(WebSocketEvent.ORDER_ACCEPTED, orderPayload);

    console.log(`Order ${orderId} accepted event emitted`);
  }

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

  emitOrderCancelledByCustomer(city: City, orderId: string) {
    const cityRoomName = this.getCityRoomName(city);

    this.io.to(cityRoomName).emit(WebSocketEvent.ORDER_CANCELLED_BY_CUSTOMER, {
      orderId,
      timestamp: new Date(),
    });

    console.log(`Order ${orderId} cancelled by customer in city: ${city}`);
  }

  sendToUser(userId: string, event: string, data: any) {
    const sockets = this.connectedUsers.get(userId);

    if (!sockets) {
      console.log(`User ${userId} not connected`);
      return;
    }

    for (const socket of sockets) {
      socket.emit(event, data);
    }

    console.log(`Event ${event} sent to user ${userId}`);
  }

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
    try {
      const data = verifyToken(token);

      return {
        userId: data.userId,
        userRole: data.role,
        city: data.city,
      };
    } catch (error) {
      console.error("Token verification error:", error);
      return null;
    }
  }

  getIO(): SocketIOServer {
    return this.io;
  }
}
