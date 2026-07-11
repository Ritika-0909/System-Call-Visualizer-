import { io } from "socket.io-client";

const URL = "http://127.0.0.1:5000";

export const socket = io(URL, {
  transports: ["websocket"],   // Force websocket for stability
  reconnection: true,          // Auto reconnect if backend restarts
  reconnectionAttempts: 5,
  timeout: 20000,
});

