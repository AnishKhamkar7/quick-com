import http from "http";
import app from "./app";
import dotenv from "dotenv";
import WebSocketService from "../src/lib/socket";

dotenv.config();

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

export const socket = new WebSocketService(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
