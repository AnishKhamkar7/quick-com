import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { WebSocketContext } from "../context/socket-context";
import {
  WebSocketEvent,
  type WebSocketOrderPayload,
  type WebSocketStatusUpdatePayload,
  type City,
} from "../types/global";

// ============================================================================
// WEBSOCKET PROVIDER
// ============================================================================

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<number | undefined>(undefined);
  const hasShownConnectedToast = useRef(false);

  // ============================================================================
  // GLOBAL EVENT LISTENERS (For notifications across the app)
  // ============================================================================

  const setupGlobalListeners = (socket: Socket) => {
    // Order Accepted
    socket.on(
      WebSocketEvent.ORDER_ACCEPTED,
      (data: WebSocketStatusUpdatePayload) => {
        toast.success("🎉 Order Accepted!", {
          description: `Your order has been accepted by ${data.deliveryPartner?.name || "delivery partner"}`,
          duration: 5000,
        });
      },
    );

    // Order Picked Up
    socket.on(WebSocketEvent.ORDER_PICKED_UP, () => {
      toast.info("📦 Order Picked Up", {
        description:
          "Your order has been picked up and is being prepared for delivery",
        duration: 5000,
      });
    });

    // Order On The Way
    socket.on(
      WebSocketEvent.ORDER_ON_THE_WAY,
      (data: WebSocketStatusUpdatePayload) => {
        toast.info("🚚 Order On The Way!", {
          description: `Your delivery partner - ${data.deliveryPartner?.name || "Delivery Partner"} is on the way with your order`,
          duration: 5000,
        });
      },
    );

    // Order Delivered
    socket.on(WebSocketEvent.ORDER_DELIVERED, () => {
      toast.success("✅ Order Delivered!", {
        description: "Your order has been delivered. Enjoy!",
        duration: 5000,
      });
    });

    // Order Cancelled
    socket.on(
      WebSocketEvent.ORDER_CANCELLED,
      (data: WebSocketStatusUpdatePayload) => {
        toast.error("❌ Order Cancelled", {
          description: data.notes || "Your order has been cancelled",
          duration: 5000,
        });
      },
    );

    // New Order (For Delivery Partners)
    socket.on(WebSocketEvent.NEW_ORDER, (data: WebSocketOrderPayload) => {
      toast.info("🆕 New Order Available", {
        description: `Order #${data.orderNumber} - ₹${data.totalAmount}`,
        duration: 5000,
      });
    });

    // Error events
    socket.on(WebSocketEvent.ERROR, (error: { message: string }) => {
      toast.error("WebSocket Error", {
        description: error.message,
        duration: 3000,
      });
    });
  };

  // ============================================================================
  // INITIALIZE SOCKET
  // ============================================================================

  useEffect(() => {
    // For cookie-based auth, we don't need to check token
    // The cookie is sent automatically with the connection
    const serverUrl =
      import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
      "http://localhost:5000";

    const newSocket = io(serverUrl, {
      withCredentials: true, // Important: Send cookies with the request
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Store socket in ref
    socketRef.current = newSocket;

    // Connection events
    newSocket.on("connect", () => {
      console.log("✅ WebSocket connected:", newSocket.id);
      setIsConnected(true);

      // Only show toast once per session
      if (!hasShownConnectedToast.current) {
        toast.success("Connected", {
          description: "Real-time updates enabled",
          duration: 2000,
        });
        hasShownConnectedToast.current = true;
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
      setIsConnected(false);
    });

    // Setup global event listeners
    setupGlobalListeners(newSocket);

    // Cleanup
    return () => {
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // ============================================================================
  // ROOM METHODS
  // ============================================================================

  const joinOrderRoom = (orderId: string) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit(WebSocketEvent.JOIN_ORDER_ROOM, { orderId });

    socket.once("joined_order_room", (data: { orderId: string }) => {
      console.log(`✅ Joined order room: ${data.orderId}`);
    });
  };

  const leaveOrderRoom = (orderId: string) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit(WebSocketEvent.LEAVE_ORDER_ROOM, { orderId });

    socket.once("left_order_room", (data: { orderId: string }) => {
      console.log(`👋 Left order room: ${data.orderId}`);
    });
  };

  const joinCityRoom = (city: City) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit(WebSocketEvent.JOIN_CITY_ROOM, { city });

    socket.once("joined_city_room", (data: { city: City }) => {
      console.log(`✅ Joined city room: ${data.city}`);
    });
  };

  const leaveCityRoom = (city: City) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit(WebSocketEvent.LEAVE_CITY_ROOM, { city });

    socket.once("left_city_room", (data: { city: City }) => {
      console.log(`👋 Left city room: ${data.city}`);
    });
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = {
    isConnected,
    joinOrderRoom,
    leaveOrderRoom,
    joinCityRoom,
    leaveCityRoom,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
