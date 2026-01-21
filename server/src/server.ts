import http from "http";
import app from "./app";
import dotenv from "dotenv";
import WebSocketService from "../src/lib/socket";

dotenv.config();

const PORT = process.env.PORT || 5000;

// 🔑 Create HTTP server from Express app
const httpServer = http.createServer(app);

// 🔑 Attach Socket.IO to HTTP server
export const socket = new WebSocketService(httpServer);

// 🚀 Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
