import { createContext, useContext } from "react";
import { type WebSocketContextType } from "../types/global";

export const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);

  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }

  return context;
};
